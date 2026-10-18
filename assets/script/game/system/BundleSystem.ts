import { assetManager, director, AssetManager, EDITOR, sys } from "cc";
import { AbstractSystem } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { UIKit, UILevel, UIPanel } from "../../framework/toolkits/uiKit/UIKit";
import { UISystem } from "./UISystem";
import {
    BundleKey,
    DEFAULT_LOBBY_SCENE_NAME,
    getManifestEntry,
    LOBBY_BUNDLE_KEY,
    MAIN_SCENE_NAME,
    resolveBundleKey,
    resolveBundleLoadName,
    SubGameId,
    getFunctionBundleImportPath,
} from "../config/BundleManifest";
import { SubGameEnterEvent, SubGameLeaveEvent } from "../event/SubGameFlowEvents";
import { AppBootstrapModel } from "../model/AppBootstrapModel";
import { GameplayContextModel } from "../model/GameplayContextModel";
import { TransitionMode } from "../../../subpackage/function/hall/sceneSwitch/script/config/TransitionConfig";

type PanelConstructor = new () => UIPanel;

/**
 * 子包 / 子游戏：bundle 加载、切场景、进退场、Dialog 打开入口（单文件集中管理）。
 */
export class BundleSystem extends AbstractSystem {
    private readonly loadedBundles = new Map<string, AssetManager.Bundle>();
    private readonly panelRegistry = new Map<PanelConstructor, string>();

    protected OnInit(): void {
        LogKit.I("[BundleSystem] init manifest entries ready");
    }

    protected OnDeinit(): void {
        this.loadedBundles.clear();
        this.panelRegistry.clear();
    }

    // #region Load

    public async loadBundle(bundleName: string): Promise<AssetManager.Bundle> {
        const resolved = resolveBundleLoadName(bundleName);
        const key = resolved.toLowerCase();
        const cached = this.loadedBundles.get(key);
        if (cached) {
            return cached;
        }
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(resolved, (err, bundle) => {
                if (err || !bundle) {
                    const legacy = resolved !== bundleName ? bundleName : resolved;
                    if (legacy !== resolved) {
                        LogKit.E(
                            "[BundleSystem] loadBundle failed name={0} (resolved={1}) err={2}",
                            bundleName,
                            resolved,
                            err?.message ?? "unknown",
                        );
                    } else {
                        LogKit.E("[BundleSystem] loadBundle failed name={0} err={1}", bundleName, err?.message ?? "unknown");
                    }
                    reject(err ?? new Error(`loadBundle failed: ${bundleName}`));
                    return;
                }
                this.loadedBundles.set(key, bundle);
                LogKit.I("[BundleSystem] loadBundle ok name={0}", resolved);
                resolve(bundle);
            });
        });
    }

    public async preloadBundles(bundleNames: string[]): Promise<void> {
        for (const name of bundleNames) {
            await this.loadBundle(name);
        }
    }

    public releaseBundle(bundleName: string): void {
        const key = bundleName.toLowerCase();
        const bundle = this.loadedBundles.get(key);
        if (bundle) {
            assetManager.removeBundle(bundle);
            this.loadedBundles.delete(key);
            LogKit.I("[BundleSystem] releaseBundle name={0}", bundleName);
        }
    }

    // #endregion

    // #region Scene

    public async loadSceneInBundle(bundleName: string, sceneName: string): Promise<void> {
        const bundle = await this.loadBundle(bundleName);
        return new Promise((resolve, reject) => {
            bundle.loadScene(sceneName, (err, sceneAsset) => {
                if (err || !sceneAsset) {
                    LogKit.E(
                        "[BundleSystem] loadScene failed bundle={0} scene={1} err={2}",
                        bundleName,
                        sceneName,
                        err?.message ?? "unknown",
                    );
                    reject(err ?? new Error(`loadScene failed: ${bundleName}/${sceneName}`));
                    return;
                }
                director.runScene(sceneAsset, undefined, () => {
                    LogKit.I("[BundleSystem] runScene bundle={0} scene={1}", bundleName, sceneName);
                    resolve();
                });
            });
        });
    }

    public async goMain(): Promise<void> {
        return new Promise((resolve, reject) => {
            director.loadScene(MAIN_SCENE_NAME, (err) => {
                if (err) {
                    LogKit.E("[BundleSystem] goMain failed err={0}", err.message);
                    reject(err);
                    return;
                }
                LogKit.I("[BundleSystem] goMain scene={0}", MAIN_SCENE_NAME);
                resolve();
            });
        });
    }

    public async preloadLobby(): Promise<void> {
        const core = ["commonUi", "networkOverlay", "audio", "lobby", "gameRules", "roomSelect", "sceneSwitch"];
        await this.preloadBundles(core);
    }

    public async goLobby(sceneName: string = DEFAULT_LOBBY_SCENE_NAME): Promise<void> {
        if (sceneName === "Transition") {
            const tr = getManifestEntry(BundleKey.SceneSwitch);
            if (!tr) {
                throw new Error("transition bundle missing in manifest");
            }
            await this.loadSceneInBundle(tr.bundleName, sceneName);
            return;
        }
        const entry = getManifestEntry(LOBBY_BUNDLE_KEY);
        if (!entry) {
            throw new Error("lobby bundle missing in manifest");
        }
        await this.loadSceneInBundle(entry.bundleName, sceneName);
    }

    // #endregion

    // #region SubGame

    public getCurrentSubGameId(): SubGameId {
        return this.GetModel(GameplayContextModel).subGameId;
    }

    public async enterGame(subGameId: SubGameId, sceneNameOverride: string | null = null): Promise<void> {
        if (subGameId === SubGameId.None) {
            throw new Error("enterGame: SubGameId.None");
        }
        const ctx = this.GetModel(GameplayContextModel);
        ctx.subGameId = subGameId;
        if (this.shouldUseTransitionScene()) {
            const mod = await import(getFunctionBundleImportPath(BundleKey.SceneSwitch, "TransitionModule"));
            mod.ensureTransitionRegistered();
            mod.startTransition({
                mode: TransitionMode.ToSubGame,
                subGameId,
                sceneNameOverride,
            });
            return;
        }
        await this.enterGameDirect(subGameId, sceneNameOverride);
    }

    /** Load and run sub-game scene (no transition hub). */
    public async enterGameDirect(subGameId: SubGameId, sceneNameOverride: string | null = null): Promise<void> {
        if (subGameId === SubGameId.None) {
            throw new Error("enterGameDirect: SubGameId.None");
        }
        const bundleKey = resolveBundleKey(subGameId);
        const entry = getManifestEntry(bundleKey);
        if (!entry) {
            LogKit.E("[BundleSystem] enterGameDirect unknown subGameId={0}", subGameId);
            throw new Error(`enterGameDirect: unknown subGameId ${subGameId}`);
        }

        const ctx = this.GetModel(GameplayContextModel);
        ctx.subGameId = subGameId;

        await this.loadBundle(entry.bundleName);

        const sceneToLoad = sceneNameOverride ?? entry.sceneName ?? entry.sceneNames[0] ?? null;
        if (sceneToLoad) {
            await this.loadSceneInBundle(entry.bundleName, sceneToLoad);
        } else {
            LogKit.I(
                "[BundleSystem] enterGameDirect bundle only subGameId={0} bundle={1}",
                subGameId,
                entry.bundleName,
            );
        }

        this.SendEvent(new SubGameEnterEvent(subGameId, bundleKey, entry.bundleName, sceneToLoad));
    }

    public async leaveGame(goLobbyAfter: boolean = true): Promise<void> {
        const ctx = this.GetModel(GameplayContextModel);
        const previous = ctx.subGameId;
        const backToHallVid = ctx.backToHallVid;
        this.SendEvent(new SubGameLeaveEvent(previous));

        if (!goLobbyAfter) {
            ctx.reset();
            return;
        }

        if (this.shouldUseTransitionScene()) {
            const mod = await import(getFunctionBundleImportPath(BundleKey.SceneSwitch, "TransitionModule"));
            mod.ensureTransitionRegistered();
            mod.startTransition({
                mode: TransitionMode.ToLobby,
                subGameId: previous,
                backToHallVid,
            });
            return;
        }

        ctx.reset();
        await this.goLobbyDirect();
        void import(getFunctionBundleImportPath(BundleKey.Lobby, "LobbyModule")).then((m) => {
            m.ensureLobbyRegistered();
            m.onLobbyEnter(1, backToHallVid);
        });
    }

    public async goLobbyDirect(sceneName: string = DEFAULT_LOBBY_SCENE_NAME): Promise<void> {
        const entry = getManifestEntry(LOBBY_BUNDLE_KEY);
        if (!entry) {
            throw new Error("lobby bundle missing in manifest");
        }
        await this.loadSceneInBundle(entry.bundleName, sceneName);
    }

    public releaseSubGameBundle(subGameId: SubGameId): void {
        if (subGameId === SubGameId.None) {
            return;
        }
        const bundleKey = resolveBundleKey(subGameId);
        const entry = getManifestEntry(bundleKey);
        if (entry?.bundleName) {
            this.releaseBundle(entry.bundleName);
        }
    }

    private shouldUseTransitionScene(): boolean {
        const bootstrap = this.GetModel(AppBootstrapModel);
        if (bootstrap.transition.enabled === false) {
            return false;
        }
        if (bootstrap.transition.skip_in_editor && (EDITOR || sys.isBrowser)) {
            return false;
        }
        return true;
    }

    // #endregion

    // #region Dialog

    public registerPanel(panelType: PanelConstructor, prefabName: string): void {
        this.panelRegistry.set(panelType, prefabName);
        UIKit.RegisterPanel(panelType, prefabName);
    }

    public registerPanelsFromManifest(): void {
        for (const [, prefabName] of this.panelRegistry) {
            LogKit.I("[BundleSystem] registerPanelsFromManifest prefab={0}", prefabName);
        }
    }

    /** @deprecated 请使用 {@link UISystem.openDialogAsync} */
    public openDialogAsync(
        panelType: PanelConstructor,
        bundleKey: BundleKey,
        prefabName: string,
        onLoaded: (panel: UIPanel) => void = null,
        canvasLevel: UILevel = UILevel.PopUI,
    ): void {
        this.GetSystem(UISystem)
            .openDialogAsync(panelType, bundleKey, prefabName, { level: canvasLevel })
            .then((panel) => {
                if (panel && onLoaded) {
                    onLoaded(panel);
                }
            })
            .catch((err) => {
                LogKit.E(
                    "[BundleSystem] openDialogAsync failed prefab={0} err={1}",
                    prefabName,
                    err instanceof Error ? err.message : String(err),
                );
            });
    }

    // #endregion

    // #region NetRoute

    /** Placeholder: map Due routes to commands when subgame push handlers are migrated. */
    public registerNetRoute(_route: number, _handler: () => void): void {
        LogKit.W("[BundleSystem] registerNetRoute not implemented route={0}", _route);
    }

    // #endregion
}

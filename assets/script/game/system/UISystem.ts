import { Node } from "cc";
import { AbstractSystem } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { IUIData, UILevel, UIPanel, UIKit } from "../../framework/toolkits/uiKit/UIKit";
import { AudioFxId } from "../config/AudioFxId";
import { BundleKey, getManifestEntry } from "../config/BundleManifest";
import { UiAnimCustomOptions, UiAnimType, UiAnimUtil } from "../utility/UiAnimUtil";
import { AudioSystem } from "./AudioSystem";

type PanelConstructor = new () => UIPanel;

export type UIOpenOptions = {
    level?: UILevel;
    uiData?: IUIData;
    anim?: UiAnimType;
    animCustom?: UiAnimCustomOptions;
    playClickSfx?: boolean;
};

export type UICloseOptions = {
    anim?: UiAnimType;
    animCustom?: UiAnimCustomOptions;
    destroy?: boolean;
};

const DEFAULT_OPEN_ANIM = UiAnimType.SlideInRight;
const DEFAULT_CLOSE_ANIM = UiAnimType.SlideOutRight;

/**
 * 业务 UI 门面：打开/关闭 Dialog + 统一动效（内部 UIKit）。
 */
export class UISystem extends AbstractSystem {
    private readonly registeredPanels = new Set<PanelConstructor>();
    private loadingTimeoutId: ReturnType<typeof setTimeout> | null = null;
    private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;
    private blockingLoadingVisible = false;

    protected OnInit(): void {}

    public openDialogAsync<T extends UIPanel>(
        panelType: PanelConstructor,
        bundleKey: BundleKey | null,
        prefabName: string,
        options: UIOpenOptions = {},
    ): Promise<T | null> {
        const {
            level = UILevel.PopUI,
            uiData = null,
            anim = DEFAULT_OPEN_ANIM,
            animCustom = null,
            playClickSfx = false,
        } = options;

        if (playClickSfx) {
            this.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        }

        this.ensurePanelRegistered(panelType, prefabName);

        const entry = bundleKey != null ? getManifestEntry(bundleKey) : null;
        const bundleName = entry?.bundleName ?? null;

        return new Promise((resolve) => {
            UIKit.OpenPanelAsync(
                panelType,
                (panel) => {
                    if (!panel) {
                        LogKit.E("[UISystem] openDialog failed prefab={0}", prefabName);
                        resolve(null);
                        return;
                    }
                    panel.Show();
                    const animRoot = UISystem.resolveAnimRoot(panel);
                    UiAnimUtil.playOpenAnim(animRoot, anim, () => resolve(panel as T), animCustom ?? undefined);
                },
                level,
                uiData,
                bundleName,
                prefabName,
            );
        });
    }

    public closeDialog(panel: UIPanel | PanelConstructor, options: UICloseOptions = {}): void {
        const { anim = DEFAULT_CLOSE_ANIM, animCustom = null, destroy = true } = options;

        let target: UIPanel | null = null;
        if (panel && (panel as UIPanel).Transform) {
            target = panel as UIPanel;
        } else {
            target = UIKit.GetPanel(panel as PanelConstructor);
        }
        if (!target?.Transform?.isValid) {
            UIKit.ClosePanel(panel as PanelConstructor);
            return;
        }

        const animRoot = UISystem.resolveAnimRoot(target);
        UiAnimUtil.playCloseAnim(animRoot, anim, () => {
            target.Close(destroy);
        }, animCustom ?? undefined);
    }

    /** 从 resources 打开（bundleKey 传 null，prefabName 为 resources 下路径） */
    public openResourcesDialogAsync<T extends UIPanel>(
        panelType: PanelConstructor,
        resourcesPrefabPath: string,
        options: UIOpenOptions = {},
    ): Promise<T | null> {
        return this.openDialogAsync(panelType, null, resourcesPrefabPath, options);
    }

    /** P0 stub: LogKit + timeout callback; later hook Common loading prefab. */
    public showBlockingLoading(timeoutSec = 0, onTimeout?: () => void): void {
        this.hideBlockingLoading();
        this.blockingLoadingVisible = true;
        LogKit.I("[UISystem] showBlockingLoading timeout={0}", timeoutSec);
        if (timeoutSec > 0 && onTimeout) {
            this.loadingTimeoutId = setTimeout(() => {
                this.loadingTimeoutId = null;
                if (this.blockingLoadingVisible) {
                    onTimeout();
                }
            }, timeoutSec * 1000);
        }
    }

    public hideBlockingLoading(): void {
        if (this.loadingTimeoutId != null) {
            clearTimeout(this.loadingTimeoutId);
            this.loadingTimeoutId = null;
        }
        if (this.blockingLoadingVisible) {
            LogKit.I("[UISystem] hideBlockingLoading");
        }
        this.blockingLoadingVisible = false;
    }

    /** P0 stub: LogKit; later hook Common toast prefab. */
    public showToast(message: string, durationSec = 2): void {
        this.hideToast();
        LogKit.I("[UISystem] toast ({0}s): {1}", durationSec, message);
        if (durationSec > 0) {
            this.toastTimeoutId = setTimeout(() => this.hideToast(), durationSec * 1000);
        }
    }

    public hideToast(): void {
        if (this.toastTimeoutId != null) {
            clearTimeout(this.toastTimeoutId);
            this.toastTimeoutId = null;
        }
    }

    private ensurePanelRegistered(panelType: PanelConstructor, prefabName: string): void {
        if (this.registeredPanels.has(panelType)) {
            return;
        }
        UIKit.RegisterPanel(panelType, prefabName);
        this.registeredPanels.add(panelType);
    }

    private static resolveAnimRoot(panel: UIPanel): Node {
        const root = panel.node.getChildByName("root");
        return root ?? panel.node;
    }
}

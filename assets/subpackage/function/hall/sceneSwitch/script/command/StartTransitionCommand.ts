import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey, getManifestEntry } from "../../../../../script/game/config/BundleManifest";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import type { TransitionIntent } from "../config/TransitionProtocol";
import { ensureTransitionRegistered } from "../TransitionModule";
import { TransitionModel } from "../model/TransitionModel";

export class StartTransitionCommand extends AbstractCommand {
    public constructor(private readonly intent: TransitionIntent) {
        super();
    }

    protected OnExecute(): void {
        ensureTransitionRegistered();
        const model = this.GetModel(TransitionModel);
        if (model.running) {
            LogKit.W("[StartTransitionCommand] transition already running");
            return;
        }
        model.intent = { ...this.intent };
        model.running = true;
        const entry = getManifestEntry(BundleKey.SceneSwitch);
        const sceneName = entry?.sceneNames[0] ?? "Transition";
        if (!entry) {
            model.running = false;
            LogKit.E("[StartTransitionCommand] transition bundle missing");
            return;
        }
        void this.GetSystem(BundleSystem)
            .loadSceneInBundle(entry.bundleName, sceneName)
            .catch((err) => {
                model.running = false;
                LogKit.E(
                    "[StartTransitionCommand] load transition scene failed err={0}",
                    err instanceof Error ? err.message : String(err),
                );
            });
    }
}

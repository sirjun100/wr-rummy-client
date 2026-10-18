import { assetManager, director, find, instantiate, Prefab } from "cc";
import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey, getManifestEntry } from "../../../../../script/game/config/BundleManifest";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { StartNetworkDelayWatchCommand } from "./StartNetworkDelayWatchCommand";
import { NetworkDelayOverlay } from "../ui/NetworkDelayOverlay";

export class AttachNetworkDelayOverlayCommand extends AbstractCommand {
    protected OnExecute(): void {
        void this.attach();
    }

    private async attach(): Promise<void> {
        const entry = getManifestEntry(BundleKey.NetworkOverlay);
        if (!entry) {
            return;
        }
        await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
        const bundle = assetManager.getBundle(entry.bundleName);
        if (!bundle) {
            return;
        }
        const prefab = await new Promise<Prefab | null>((resolve) => {
            bundle.load("prefab/NetworkDelay", Prefab, (err, asset) => {
                resolve(err ? null : asset);
            });
        });
        if (!prefab) {
            return;
        }
        const canvas = find("Canvas") ?? director.getScene()?.getChildByName("Canvas");
        if (!canvas) {
            return;
        }
        canvas.getChildByName("networkNode")?.destroy();
        const node = instantiate(prefab);
        node.name = "networkNode";
        canvas.addChild(node);
        NetworkDelayOverlay.bindRoot(node);
        NetworkDelayOverlay.applyLandscape();
        this.SendCommand(new StartNetworkDelayWatchCommand());
    }
}

import { find } from "cc";
import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { StopNetworkDelayWatchCommand } from "./StopNetworkDelayWatchCommand";
import { NetworkDelayOverlay } from "../ui/NetworkDelayOverlay";
import { NetworkDelayModel } from "../model/NetworkDelayModel";

export class DetachNetworkDelayOverlayCommand extends AbstractCommand {
    protected OnExecute(): void {
        this.SendCommand(new StopNetworkDelayWatchCommand());
        const canvas = find("Canvas");
        const node = canvas?.getChildByName("networkNode");
        node?.destroy();
        NetworkDelayOverlay.clearRoot();
        const model = this.GetModel(NetworkDelayModel);
        model.silentSec.value = 0;
        model.overlayVisible.value = false;
        model.alertShown = false;
    }
}

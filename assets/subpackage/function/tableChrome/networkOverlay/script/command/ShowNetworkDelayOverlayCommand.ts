import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { NetworkDelayModel } from "../model/NetworkDelayModel";
import { NetworkDelayOverlay } from "../ui/NetworkDelayOverlay";

export class ShowNetworkDelayOverlayCommand extends AbstractCommand {
    private readonly visible: boolean;

    public constructor(visible: boolean) {
        super();
        this.visible = visible;
    }

    protected OnExecute(): void {
        this.GetModel(NetworkDelayModel).overlayVisible.value = this.visible;
        NetworkDelayOverlay.setOverlayVisible(this.visible);
    }
}

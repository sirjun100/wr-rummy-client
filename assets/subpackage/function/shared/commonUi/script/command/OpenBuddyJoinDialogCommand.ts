import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import type { BuddyJoinUiData } from "../config/PublicProtocol";
import { BuddyRoomJoinDialog } from "../ui/BuddyRoomJoinDialog";

export class OpenBuddyJoinDialogCommand extends AbstractCommand {
    public constructor(private readonly uiData: BuddyJoinUiData = {}) {
        super();
    }

    protected OnExecute(): void {
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("commonUi");
        await this.GetSystem(UISystem).openDialogAsync(BuddyRoomJoinDialog, BundleKey.CommonUi, "BuddyRoomJoinDialog", {
            uiData: this.uiData,
            level: UILevel.PopUI,
        });
    }
}

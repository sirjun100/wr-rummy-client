import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { PaymentDialogId } from "../../../../../script/game/commerce/config/PaymentDialogId";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { MembershipDialog } from "../ui/MembershipDialog";

export class OpenMembershipDialogCommand extends AbstractCommand {
    protected OnExecute(): void {
        const ui = this.GetSystem(UISystem);
        void ui.openDialogAsync(MembershipDialog, BundleKey.VipClub, PaymentDialogId.Membership, {
            uiData: {},
            level: UILevel.PopUI,
        });
    }
}

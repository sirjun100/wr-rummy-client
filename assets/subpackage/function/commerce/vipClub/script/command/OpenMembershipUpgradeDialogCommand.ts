import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { PaymentDialogId } from "../../../../../script/game/commerce/config/PaymentDialogId";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { MembershipUpgradeDialog } from "../ui/MembershipUpgradeDialog";
import { MembershipUpgradeGameDialog } from "../ui/MembershipUpgradeGameDialog";

export class OpenMembershipUpgradeDialogCommand extends AbstractCommand {
    private readonly inGame: boolean;

    public constructor(inGame: boolean) {
        super();
        this.inGame = inGame;
    }

    protected OnExecute(): void {
        const ui = this.GetSystem(UISystem);
        const panel = this.inGame ? MembershipUpgradeGameDialog : MembershipUpgradeDialog;
        const prefab = this.inGame
            ? PaymentDialogId.MembershipUpgradeGameDialog
            : PaymentDialogId.MembershipUpgradeDialog;
        void ui.openDialogAsync(panel, BundleKey.VipClub, prefab, { uiData: {}, level: UILevel.PopUI });
    }
}

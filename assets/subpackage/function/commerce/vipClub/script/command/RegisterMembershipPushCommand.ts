import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { PaymentRoute } from "../../../../../script/game/commerce/config/PaymentRoute";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import type { MembershipClubPushDto } from "../config/MembershipProtocol";
import { MembershipModel } from "../model/MembershipModel";
import { syncPaymentSummaryFromPlayerClub } from "../utility/MembershipSummarySync";
import { SubGameId } from "../../../../../script/game/config/BundleManifest";
import { GameplayContextModel } from "../../../../../script/game/model/GameplayContextModel";
import { EnqueueMembershipUpgradeCommand } from "./EnqueueMembershipUpgradeCommand";
import { OpenMembershipUpgradeDialogCommand } from "./OpenMembershipUpgradeDialogCommand";

let registered = false;

export class RegisterMembershipPushCommand extends AbstractCommand {
    protected OnExecute(): void {
        if (registered) {
            return;
        }
        registered = true;
        const net = this.GetSystem(NetworkSystem);
        net.addLobbyPushListener(PaymentRoute.MembershipClubPush, (payload) => {
            const data = payload as MembershipClubPushDto;
            const model = this.GetModel(MembershipModel);
            if (data.player_club) {
                model.applyPlayerClub(data.player_club);
                syncPaymentSummaryFromPlayerClub(data.player_club);
            }
            if (data.upgrade) {
                model.pendingUpgrade.value = { ...data.upgrade };
                const inGame = this.GetModel(GameplayContextModel).subGameId !== SubGameId.None;
                if (inGame) {
                    this.SendCommand(new OpenMembershipUpgradeDialogCommand(true));
                } else {
                    this.SendCommand(new EnqueueMembershipUpgradeCommand());
                }
            }
        });
    }
}

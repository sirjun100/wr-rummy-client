import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { GameApp } from "../../../../../script/game/GameApp";
import { OpenMembershipUpgradeDialogCommand } from "./OpenMembershipUpgradeDialogCommand";

export class EnqueueMembershipUpgradeCommand extends AbstractCommand {
    protected OnExecute(): void {
        void import("../../../social/inviteShare/script/utility/LobbyActivityQueue").then((q) => {
            q.enqueueLobbyActivity(() => {
                GameApp.Interface.SendCommand(new OpenMembershipUpgradeDialogCommand(false));
            });
            q.runNextLobbyActivity();
        });
    }
}

import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { InvitePushRoute } from "../config/ShareConfig";
import { InviteRewardFlagEvent } from "../event/ShareEvents";
import { ShareModel } from "../model/ShareModel";

let registered = false;

export class RegisterSharePushCommand extends AbstractCommand {
    protected OnExecute(): void {
        if (registered) {
            return;
        }
        registered = true;
        const net = this.GetSystem(NetworkSystem);
        net.addLobbyPushListener(InvitePushRoute.RewardFlag, (payload) => {
            const data = payload as { has_invite_reward?: number };
            const flag = data.has_invite_reward ?? 1;
            this.GetModel(ShareModel).hasInviteReward.value = flag;
            this.SendEvent(new InviteRewardFlagEvent(flag === 1));
        });
    }
}

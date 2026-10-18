import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { ShareRoute } from "../config/ShareConfig";
import type { ShareStatRes } from "../config/ShareConfig";
import { InviteRewardFlagEvent } from "../event/ShareEvents";
import { ShareModel } from "../model/ShareModel";

export class FetchShareStatCommand extends AbstractCommand {
    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<ShareStatRes>(ShareRoute.Stat, {})
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    return;
                }
                const flag = res.data?.has_invite_reward ?? 0;
                this.GetModel(ShareModel).hasInviteReward.value = flag;
                if (flag === 1) {
                    this.SendEvent(new InviteRewardFlagEvent(true));
                }
            })
            .catch((err) => {
                LogKit.W("[FetchShareStatCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

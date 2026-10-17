import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { DailyCheckinClaimRes, DailyCheckinRoute } from "../config/DailyCheckinConfig";
import {
    DailyCheckinClaimFailedEvent,
    DailyCheckinClaimSuccessEvent,
} from "../event/DailyCheckinEvents";
import { DailyCheckinModel } from "../model/DailyCheckinModel";

export class ClaimDailyCheckinRewardCommand extends AbstractCommand {
    public constructor(private readonly day: number) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<DailyCheckinClaimRes>(DailyCheckinRoute.Claim, { day: this.day })
            .then((res) => {
                if (res.page) {
                    this.GetModel(DailyCheckinModel).page.value = res.page;
                }
                this.SendEvent(new DailyCheckinClaimSuccessEvent(res));
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[ClaimDailyCheckinRewardCommand] {0}", msg);
                this.SendEvent(new DailyCheckinClaimFailedEvent(msg));
            });
    }
}

import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { DailyWorkClaimRes, DailyWorkRoute } from "../config/DailyWorkConfig";
import {
    DailyWorkClaimFailedEvent,
    DailyWorkClaimSuccessEvent,
} from "../event/DailyWorkEvents";
import { DailyWorkModel } from "../model/DailyWorkModel";

export class ClaimDailyWorkRewardCommand extends AbstractCommand {
    public constructor(private readonly tid: number) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<DailyWorkClaimRes>(DailyWorkRoute.Claim, { tid: this.tid })
            .then((res) => {
                if (res.page) {
                    this.GetModel(DailyWorkModel).page.value = res.page;
                }
                this.SendEvent(new DailyWorkClaimSuccessEvent(res));
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[ClaimDailyWorkRewardCommand] {0}", msg);
                this.SendEvent(new DailyWorkClaimFailedEvent(msg));
            });
    }
}

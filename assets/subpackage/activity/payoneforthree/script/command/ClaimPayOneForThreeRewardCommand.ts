import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { PayOneForThreeClaimRes, PayOneForThreeRoute } from "../config/PayOneForThreeConfig";
import {
    PayOneForThreeClaimFailedEvent,
    PayOneForThreeClaimSuccessEvent,
} from "../event/PayOneForThreeEvents";
import { PayOneForThreeModel } from "../model/PayOneForThreeModel";

export class ClaimPayOneForThreeRewardCommand extends AbstractCommand {
    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<PayOneForThreeClaimRes>(PayOneForThreeRoute.Claim, {})
            .then((res) => {
                const page = res.pay_one_for_three_data ?? res.ext ?? null;
                if (page) {
                    this.GetModel(PayOneForThreeModel).page.value = page;
                }
                this.SendEvent(new PayOneForThreeClaimSuccessEvent(res));
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[ClaimPayOneForThreeRewardCommand] {0}", msg);
                this.SendEvent(new PayOneForThreeClaimFailedEvent(msg));
            });
    }
}

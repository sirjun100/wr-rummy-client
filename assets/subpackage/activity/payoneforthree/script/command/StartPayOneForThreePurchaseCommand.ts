import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { PlatformSystem } from "../../../../../script/game/system/PlatformSystem";
import { PayOneForThreePurchaseRes, PayOneForThreeRoute } from "../config/PayOneForThreeConfig";
import {
    PayOneForThreePurchaseFailedEvent,
    PayOneForThreePurchaseSuccessEvent,
} from "../event/PayOneForThreeEvents";
import { PayOneForThreeModel } from "../model/PayOneForThreeModel";

export class StartPayOneForThreePurchaseCommand extends AbstractCommand {
    public constructor(
        private readonly goodId: number,
        private readonly price: number,
    ) {
        super();
    }

    protected OnExecute(): void {
        const platform = this.GetSystem(PlatformSystem);
        void platform
            .startPayOneForThreePay(this.price, this.goodId)
            .then(() => this.confirmPurchase())
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[StartPayOneForThreePurchaseCommand] {0}", msg);
                this.SendEvent(new PayOneForThreePurchaseFailedEvent(msg));
            });
    }

    private confirmPurchase(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<PayOneForThreePurchaseRes>(PayOneForThreeRoute.Purchase, {
                good_id: this.goodId,
                price: this.price,
            })
            .then((res) => {
                const page = res.pay_one_for_three_data ?? res.page ?? null;
                if (!page) {
                    this.SendEvent(new PayOneForThreePurchaseFailedEvent("empty page"));
                    return;
                }
                this.GetModel(PayOneForThreeModel).page.value = page;
                this.SendEvent(new PayOneForThreePurchaseSuccessEvent(page));
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[StartPayOneForThreePurchaseCommand] confirm {0}", msg);
                this.SendEvent(new PayOneForThreePurchaseFailedEvent(msg));
            });
    }
}

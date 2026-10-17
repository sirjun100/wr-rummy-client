import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { PlatformSystem } from "../../../../../script/game/system/PlatformSystem";
import { RechargeEventRoute } from "../config/RechargeEventConfig";
import { FirstBuyPurchaseFailedEvent, FirstBuyPurchaseSuccessEvent } from "../event/FirstBuyEvents";
import { FirstBuyModel } from "../model/FirstBuyModel";

export class StartFirstBuyPurchaseCommand extends AbstractCommand {
    public constructor(
        private readonly price: number,
        private readonly tierIndex: number,
    ) {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(PlatformSystem)
            .startFirstRechargePay(this.price, this.tierIndex)
            .then(() => this.confirm())
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                this.SendEvent(new FirstBuyPurchaseFailedEvent(msg));
            });
    }

    private confirm(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<{
                msg?: string;
                first_recharge_data?: FirstBuyModel["page"]["value"];
            }>(RechargeEventRoute.FirstPurchase, { tier_index: this.tierIndex })
            .then((res) => {
                if (res.first_recharge_data) {
                    this.GetModel(FirstBuyModel).page.value = res.first_recharge_data;
                }
                this.SendEvent(new FirstBuyPurchaseSuccessEvent(res.msg ?? ""));
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[StartFirstBuyPurchaseCommand] {0}", msg);
                this.SendEvent(new FirstBuyPurchaseFailedEvent(msg));
            });
    }
}

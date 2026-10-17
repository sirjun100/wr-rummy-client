import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { PlatformSystem } from "../../../../../script/game/system/PlatformSystem";
import { RechargeEventRoute } from "../config/RechargeEventConfig";
import { RebatePurchaseFailedEvent, RebatePurchaseSuccessEvent } from "../event/RebateEvents";
import { RebateModel } from "../model/RebateModel";

export class StartRebatePurchaseCommand extends AbstractCommand {
    public constructor(
        private readonly price: number,
        private readonly tierIndex: number,
    ) {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(PlatformSystem)
            .startRebateRechargePay(this.price, this.tierIndex)
            .then(() =>
                this.GetSystem(NetworkSystem).callLobby<{
                    msg?: string;
                    rebate_recharge_data?: RebateModel["page"]["value"];
                }>(RechargeEventRoute.RebatePurchase, { tier_index: this.tierIndex }),
            )
            .then((res) => {
                if (res.rebate_recharge_data) {
                    this.GetModel(RebateModel).page.value = res.rebate_recharge_data;
                }
                this.SendEvent(new RebatePurchaseSuccessEvent(res.msg ?? ""));
            })
            .catch((err) => this.SendEvent(new RebatePurchaseFailedEvent(String(err))));
    }
}

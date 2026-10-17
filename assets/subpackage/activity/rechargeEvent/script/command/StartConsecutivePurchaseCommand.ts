import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { PlatformSystem } from "../../../../../script/game/system/PlatformSystem";
import { RechargeEventRoute } from "../config/RechargeEventConfig";
import { ConsecutivePurchaseFailedEvent, ConsecutivePurchaseSuccessEvent } from "../event/ConsecutiveEvents";
import { ConsecutiveModel } from "../model/ConsecutiveModel";

export class StartConsecutivePurchaseCommand extends AbstractCommand {
    public constructor(
        private readonly price: number,
        private readonly day: number,
        private readonly actNum: string,
    ) {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(PlatformSystem)
            .startConsecutiveGiftPay(this.price, this.day)
            .then(() =>
                this.GetSystem(NetworkSystem).callLobby<{
                    msg?: string;
                    consecutive_gift_data?: ConsecutiveModel["page"]["value"];
                }>(RechargeEventRoute.ConsecutivePurchase, {
                    day: this.day,
                    act_num: this.actNum,
                }),
            )
            .then((res) => {
                if (res.consecutive_gift_data) {
                    this.GetModel(ConsecutiveModel).page.value = res.consecutive_gift_data;
                }
                this.SendEvent(new ConsecutivePurchaseSuccessEvent(res.msg ?? ""));
            })
            .catch((err) => this.SendEvent(new ConsecutivePurchaseFailedEvent(String(err))));
    }
}

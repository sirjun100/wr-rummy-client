import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { PlatformSystem } from "../../../../../script/game/system/PlatformSystem";
import { RechargeEventRoute } from "../config/RechargeEventConfig";
import { WholeDayPurchaseFailedEvent, WholeDayPurchaseSuccessEvent } from "../event/WholeDayEvents";
import { WholeDayModel } from "../model/WholeDayModel";

export class StartWholeDayPurchaseCommand extends AbstractCommand {
    public constructor(private readonly price: number) {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(PlatformSystem)
            .startTwentyFourRechargePay(this.price)
            .then(() => this.confirm())
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                this.SendEvent(new WholeDayPurchaseFailedEvent(msg));
            });
    }

    private confirm(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<{
                msg?: string;
                twenty_four_recharge_data?: WholeDayModel["page"]["value"];
            }>(RechargeEventRoute.TwentyFourPurchase, {})
            .then((res) => {
                if (res.twenty_four_recharge_data) {
                    this.GetModel(WholeDayModel).page.value = res.twenty_four_recharge_data;
                }
                this.SendEvent(new WholeDayPurchaseSuccessEvent(res.msg ?? ""));
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[StartWholeDayPurchaseCommand] {0}", msg);
                this.SendEvent(new WholeDayPurchaseFailedEvent(msg));
            });
    }
}

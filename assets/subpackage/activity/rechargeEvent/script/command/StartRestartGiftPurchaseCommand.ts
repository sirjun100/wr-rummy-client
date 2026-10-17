import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { PlatformSystem } from "../../../../../script/game/system/PlatformSystem";
import { RechargeEventRoute } from "../config/RechargeEventConfig";
import { RestartGiftActionFailedEvent, RestartGiftActionSuccessEvent } from "../event/RestartGiftEvents";
import { RestartGiftModel } from "../model/RestartGiftModel";

export class StartRestartGiftPurchaseCommand extends AbstractCommand {
    protected OnExecute(): void {
        const page = this.GetModel(RestartGiftModel).page.value;
        const price = Number(page?.instant_amount ?? 0);
        void this.GetSystem(PlatformSystem)
            .startRestartGiftPay(price)
            .then(() => this.post(RechargeEventRoute.RestartPurchase, {}))
            .catch((err) => this.SendEvent(new RestartGiftActionFailedEvent(String(err))));
    }

    private post(route: number, body: object): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<{ msg?: string; restart_gift_data?: RestartGiftModel["page"]["value"] }>(route, body)
            .then((res) => {
                if (res.restart_gift_data) {
                    this.GetModel(RestartGiftModel).page.value = res.restart_gift_data;
                }
                this.SendEvent(new RestartGiftActionSuccessEvent(res.msg ?? ""));
            })
            .catch((err) => {
                LogKit.W("[StartRestartGiftPurchaseCommand] {0}", err);
                this.SendEvent(new RestartGiftActionFailedEvent(String(err)));
            });
    }
}

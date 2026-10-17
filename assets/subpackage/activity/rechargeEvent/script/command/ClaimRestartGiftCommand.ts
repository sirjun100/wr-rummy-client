import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { RechargeEventRoute } from "../config/RechargeEventConfig";
import { RestartGiftActionFailedEvent, RestartGiftActionSuccessEvent } from "../event/RestartGiftEvents";
import { RestartGiftModel } from "../model/RestartGiftModel";

export class ClaimRestartGiftCommand extends AbstractCommand {
    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<{ msg?: string; restart_gift_data?: RestartGiftModel["page"]["value"] }>(
                RechargeEventRoute.RestartClaim,
                {},
            )
            .then((res) => {
                if (res.restart_gift_data) {
                    this.GetModel(RestartGiftModel).page.value = res.restart_gift_data;
                }
                this.SendEvent(new RestartGiftActionSuccessEvent(res.msg ?? ""));
            })
            .catch((err) => this.SendEvent(new RestartGiftActionFailedEvent(String(err))));
    }
}

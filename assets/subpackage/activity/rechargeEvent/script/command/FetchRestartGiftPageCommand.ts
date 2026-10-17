import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { RechargeEventRoute } from "../config/RechargeEventConfig";
import { RestartGiftPageFetchFailedEvent, RestartGiftPageReadyEvent } from "../event/RestartGiftEvents";
import { RestartGiftModel } from "../model/RestartGiftModel";

export class FetchRestartGiftPageCommand extends AbstractCommand {
    public constructor(private readonly vid: number = 0) {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<{ restart_gift_data?: RestartGiftModel["page"]["value"] }>(
                RechargeEventRoute.RestartPage,
                { vid: this.vid },
            )
            .then((res) => {
                const page = res.restart_gift_data ?? null;
                if (!page) {
                    this.SendEvent(new RestartGiftPageFetchFailedEvent("empty"));
                    return;
                }
                this.GetModel(RestartGiftModel).page.value = page;
                this.SendEvent(new RestartGiftPageReadyEvent());
            })
            .catch((err) => {
                this.SendEvent(new RestartGiftPageFetchFailedEvent(String(err)));
            });
    }
}

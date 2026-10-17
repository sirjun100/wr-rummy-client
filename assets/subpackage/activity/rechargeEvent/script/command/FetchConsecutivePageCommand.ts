import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { RechargeEventRoute } from "../config/RechargeEventConfig";
import { ConsecutivePageFetchFailedEvent, ConsecutivePageReadyEvent } from "../event/ConsecutiveEvents";
import { ConsecutiveModel } from "../model/ConsecutiveModel";

export class FetchConsecutivePageCommand extends AbstractCommand {
    public constructor(private readonly vid: number = 0) {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<{ consecutive_gift_data?: ConsecutiveModel["page"]["value"] }>(
                RechargeEventRoute.ConsecutivePage,
                { vid: this.vid },
            )
            .then((res) => {
                const page = res.consecutive_gift_data ?? null;
                if (!page) {
                    this.SendEvent(new ConsecutivePageFetchFailedEvent("empty"));
                    return;
                }
                this.GetModel(ConsecutiveModel).page.value = page;
                this.SendEvent(new ConsecutivePageReadyEvent());
            })
            .catch((err) => this.SendEvent(new ConsecutivePageFetchFailedEvent(String(err))));
    }
}

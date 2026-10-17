import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { RechargeEventRoute } from "../config/RechargeEventConfig";
import { RebatePageFetchFailedEvent, RebatePageReadyEvent } from "../event/RebateEvents";
import { RebateModel } from "../model/RebateModel";

export class FetchRebatePageCommand extends AbstractCommand {
    public constructor(private readonly vid: number = 0) {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<{ rebate_recharge_data?: RebateModel["page"]["value"] }>(
                RechargeEventRoute.RebatePage,
                { vid: this.vid },
            )
            .then((res) => {
                const page = res.rebate_recharge_data ?? null;
                if (!page) {
                    this.SendEvent(new RebatePageFetchFailedEvent("empty"));
                    return;
                }
                this.GetModel(RebateModel).page.value = page;
                this.SendEvent(new RebatePageReadyEvent());
            })
            .catch((err) => this.SendEvent(new RebatePageFetchFailedEvent(String(err))));
    }
}

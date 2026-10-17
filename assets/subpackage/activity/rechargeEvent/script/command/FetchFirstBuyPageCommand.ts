import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { RechargeEventRoute } from "../config/RechargeEventConfig";
import { FirstBuyPageFetchFailedEvent, FirstBuyPageReadyEvent } from "../event/FirstBuyEvents";
import { FirstBuyModel } from "../model/FirstBuyModel";

export class FetchFirstBuyPageCommand extends AbstractCommand {
    public constructor(private readonly vid: number = 0) {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<{ first_recharge_data?: FirstBuyModel["page"]["value"] }>(
                RechargeEventRoute.FirstPage,
                { vid: this.vid },
            )
            .then((res) => {
                const page = res.first_recharge_data ?? null;
                if (!page) {
                    this.SendEvent(new FirstBuyPageFetchFailedEvent("empty"));
                    return;
                }
                this.GetModel(FirstBuyModel).page.value = page;
                this.SendEvent(new FirstBuyPageReadyEvent());
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[FetchFirstBuyPageCommand] {0}", msg);
                this.SendEvent(new FirstBuyPageFetchFailedEvent(msg));
            });
    }
}

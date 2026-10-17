import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { RechargeEventRoute } from "../config/RechargeEventConfig";
import { WholeDayPageFetchFailedEvent, WholeDayPageReadyEvent } from "../event/WholeDayEvents";
import { WholeDayModel } from "../model/WholeDayModel";

export class FetchWholeDayPageCommand extends AbstractCommand {
    public constructor(private readonly vid: number = 0) {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<{ twenty_four_recharge_data?: WholeDayModel["page"]["value"] }>(
                RechargeEventRoute.TwentyFourPage,
                { vid: this.vid },
            )
            .then((res) => {
                const page = res.twenty_four_recharge_data ?? null;
                if (!page) {
                    this.SendEvent(new WholeDayPageFetchFailedEvent("empty"));
                    return;
                }
                this.GetModel(WholeDayModel).page.value = page;
                this.SendEvent(new WholeDayPageReadyEvent());
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[FetchWholeDayPageCommand] {0}", msg);
                this.SendEvent(new WholeDayPageFetchFailedEvent(msg));
            });
    }
}

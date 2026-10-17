import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { WeeklyMonthCardPageRes, WeeklyMonthCardRoute } from "../config/WeeklyMonthCardConfig";
import { WeeklyMonthCardPageFetchFailedEvent, WeeklyMonthCardPageReadyEvent } from "../event/WeeklyMonthCardEvents";
import { WeeklyMonthCardModel } from "../model/WeeklyMonthCardModel";

export class FetchWeeklyMonthCardPageCommand extends AbstractCommand {
    public constructor(
        private readonly openAct: number = 1,
        private readonly vid: number = 0,
    ) {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<WeeklyMonthCardPageRes>(WeeklyMonthCardRoute.Page, {
                open_act: this.openAct,
                vid: this.vid,
            })
            .then((res) => {
                const page = res.week_month_card_data ?? null;
                if (!page) {
                    this.SendEvent(new WeeklyMonthCardPageFetchFailedEvent("empty page"));
                    return;
                }
                this.GetModel(WeeklyMonthCardModel).page.value = page;
                this.SendEvent(new WeeklyMonthCardPageReadyEvent(this.vid));
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[FetchWeeklyMonthCardPageCommand] {0}", msg);
                this.SendEvent(new WeeklyMonthCardPageFetchFailedEvent(msg));
            });
    }
}

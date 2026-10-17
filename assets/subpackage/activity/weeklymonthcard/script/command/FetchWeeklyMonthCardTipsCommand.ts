import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { WeeklyMonthCardRoute, WeeklyMonthCardTipsRes } from "../config/WeeklyMonthCardConfig";
import { WeeklyMonthCardTipsFetchFailedEvent, WeeklyMonthCardTipsReadyEvent } from "../event/WeeklyMonthCardEvents";
import { WeeklyMonthCardModel } from "../model/WeeklyMonthCardModel";

export class FetchWeeklyMonthCardTipsCommand extends AbstractCommand {
    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<WeeklyMonthCardTipsRes>(WeeklyMonthCardRoute.Tips, {})
            .then((res) => {
                const tips = res.tips ?? "";
                this.GetModel(WeeklyMonthCardModel).tips.value = tips;
                this.SendEvent(new WeeklyMonthCardTipsReadyEvent());
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[FetchWeeklyMonthCardTipsCommand] {0}", msg);
                this.SendEvent(new WeeklyMonthCardTipsFetchFailedEvent(msg));
            });
    }
}

import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { DailyCheckinPageRes, DailyCheckinRoute } from "../config/DailyCheckinConfig";
import { DailyCheckinFetchFailedEvent } from "../event/DailyCheckinEvents";
import { DailyCheckinModel } from "../model/DailyCheckinModel";

export class FetchDailyCheckinPageCommand extends AbstractCommand {
    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<DailyCheckinPageRes>(DailyCheckinRoute.Page, {})
            .then((res) => {
                const page = res.daily_login_act_data ?? null;
                if (!page) {
                    this.SendEvent(new DailyCheckinFetchFailedEvent("empty page"));
                    return;
                }
                this.GetModel(DailyCheckinModel).page.value = page;
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[FetchDailyCheckinPageCommand] {0}", msg);
                this.SendEvent(new DailyCheckinFetchFailedEvent(msg));
            });
    }
}

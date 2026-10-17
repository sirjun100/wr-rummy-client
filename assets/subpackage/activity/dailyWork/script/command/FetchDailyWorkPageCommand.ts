import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { DailyWorkPageRes, DailyWorkRoute } from "../config/DailyWorkConfig";
import { DailyWorkFetchFailedEvent } from "../event/DailyWorkEvents";
import { DailyWorkModel } from "../model/DailyWorkModel";

export class FetchDailyWorkPageCommand extends AbstractCommand {
    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<DailyWorkPageRes>(DailyWorkRoute.Page, {})
            .then((res) => {
                const page = res.back_card_task_data ?? null;
                if (!page) {
                    this.SendEvent(new DailyWorkFetchFailedEvent("empty page"));
                    return;
                }
                this.GetModel(DailyWorkModel).page.value = page;
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[FetchDailyWorkPageCommand] {0}", msg);
                this.SendEvent(new DailyWorkFetchFailedEvent(msg));
            });
    }
}

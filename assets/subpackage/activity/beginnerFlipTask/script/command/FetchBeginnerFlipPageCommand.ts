import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import {
    BeginnerFlipPageRes,
    BeginnerFlipTaskRoute,
} from "../config/BeginnerFlipTaskConfig";
import { BeginnerFlipPageFetchFailedEvent } from "../event/BeginnerFlipTaskEvents";
import { BeginnerFlipTaskModel } from "../model/BeginnerFlipTaskModel";

export class FetchBeginnerFlipPageCommand extends AbstractCommand {
    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<BeginnerFlipPageRes>(BeginnerFlipTaskRoute.Page, {})
            .then((res) => {
                const page = res.flop_cash_task_data ?? null;
                if (!page) {
                    this.SendEvent(new BeginnerFlipPageFetchFailedEvent("empty page"));
                    return;
                }
                this.GetModel(BeginnerFlipTaskModel).page.value = page;
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[FetchBeginnerFlipPageCommand] {0}", msg);
                this.SendEvent(new BeginnerFlipPageFetchFailedEvent(msg));
            });
    }
}

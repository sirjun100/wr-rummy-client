import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { NewPlayerTaskPageRes, NewPlayerTaskRoute } from "../config/NewPlayerTaskConfig";
import {
    NewPlayerTaskPageFetchFailedEvent,
    NewPlayerTaskPageReadyEvent,
} from "../event/NewPlayerTaskEvents";
import { NewPlayerTaskModel } from "../model/NewPlayerTaskModel";

export class FetchNewPlayerTaskPageCommand extends AbstractCommand {
    public constructor(private readonly vid: number = 0) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        const vid = this.vid;
        void net
            .callLobby<NewPlayerTaskPageRes>(NewPlayerTaskRoute.Page, { vid })
            .then((res) => {
                const page = res.new_player_task_data ?? null;
                if (!page) {
                    this.SendEvent(new NewPlayerTaskPageFetchFailedEvent("empty page"));
                    return;
                }
                this.GetModel(NewPlayerTaskModel).page.value = page;
                this.SendEvent(new NewPlayerTaskPageReadyEvent(vid));
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[FetchNewPlayerTaskPageCommand] {0}", msg);
                this.SendEvent(new NewPlayerTaskPageFetchFailedEvent(msg));
            });
    }
}

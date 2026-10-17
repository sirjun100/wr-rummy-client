import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { EarthquakesQuery, EarthquakesRoute, EarthquakesTaskRes } from "../config/EarthquakesConfig";
import { EarthquakesTaskFetchFailedEvent } from "../event/EarthquakesEvents";
import { EarthquakesModel } from "../model/EarthquakesModel";

export class FetchEarthquakesTaskCommand extends AbstractCommand {
    public constructor(private readonly query: EarthquakesQuery) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<EarthquakesTaskRes>(EarthquakesRoute.Task, this.query)
            .then((res) => {
                if (!res.task) {
                    this.SendEvent(new EarthquakesTaskFetchFailedEvent("empty task"));
                    return;
                }
                this.GetModel(EarthquakesModel).task.value = res.task;
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[FetchEarthquakesTaskCommand] {0}", msg);
                this.SendEvent(new EarthquakesTaskFetchFailedEvent(msg));
            });
    }
}

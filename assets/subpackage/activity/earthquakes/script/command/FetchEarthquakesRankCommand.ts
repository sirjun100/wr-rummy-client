import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { EarthquakesQuery, EarthquakesRankRes, EarthquakesRoute } from "../config/EarthquakesConfig";
import { EarthquakesRankFetchFailedEvent } from "../event/EarthquakesEvents";
import { EarthquakesModel } from "../model/EarthquakesModel";

export class FetchEarthquakesRankCommand extends AbstractCommand {
    public constructor(private readonly query: EarthquakesQuery) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<EarthquakesRankRes>(EarthquakesRoute.Rank, this.query)
            .then((res) => {
                if (!res.rank) {
                    this.SendEvent(new EarthquakesRankFetchFailedEvent("empty rank"));
                    return;
                }
                this.GetModel(EarthquakesModel).rank.value = res.rank;
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[FetchEarthquakesRankCommand] {0}", msg);
                this.SendEvent(new EarthquakesRankFetchFailedEvent(msg));
            });
    }
}

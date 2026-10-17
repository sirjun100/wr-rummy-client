import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { EarthquakesPageRes, EarthquakesQuery, EarthquakesRoute } from "../config/EarthquakesConfig";
import { EarthquakesPageFetchFailedEvent } from "../event/EarthquakesEvents";
import { EarthquakesModel } from "../model/EarthquakesModel";

export class FetchEarthquakesPageCommand extends AbstractCommand {
    public constructor(private readonly query: EarthquakesQuery) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<EarthquakesPageRes>(EarthquakesRoute.Page, this.query)
            .then((res) => {
                const page = res.treasure_hunt_data ?? null;
                if (!page) {
                    this.SendEvent(new EarthquakesPageFetchFailedEvent("empty page"));
                    return;
                }
                this.GetModel(EarthquakesModel).mainPage.value = page;
                if (page.ctask) {
                    this.GetModel(EarthquakesModel).task.value = page.ctask;
                }
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[FetchEarthquakesPageCommand] {0}", msg);
                this.SendEvent(new EarthquakesPageFetchFailedEvent(msg));
            });
    }
}

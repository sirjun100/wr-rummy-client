import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { HALL_HOME_FETCH_DEBOUNCE_MS, LobbyRoute } from "../config/LobbyConfig";
import type { HallHomeReq, HallHomeRes } from "../config/LobbyProtocol";
import { LobbyHomeReadyEvent, UpdateActCollectOpenEvent } from "../event/LobbyEvents";
import { LobbyModel } from "../model/LobbyModel";
import { ApplyHallActVisibilityCommand } from "./ApplyHallActVisibilityCommand";

export class FetchHallHomeCommand extends AbstractCommand {
    constructor(
        private readonly req: HallHomeReq = {},
        private readonly force = false,
    ) {
        super();
    }

    protected OnExecute(): void {
        const model = this.GetModel(LobbyModel);
        const now = Date.now();
        if (!this.force && now - model.lastFetchAt < HALL_HOME_FETCH_DEBOUNCE_MS) {
            this.SendCommand(new ApplyHallActVisibilityCommand());
            this.SendEvent(new UpdateActCollectOpenEvent(model.home.value));
            return;
        }
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<HallHomeRes>(LobbyRoute.HallHome, {
                is_back_to_hall: this.req.is_back_to_hall ?? 0,
                vid: this.req.vid ?? 0,
            })
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[FetchHallHomeCommand] code={0}", res.code);
                    return;
                }
                const home = res.data ?? {};
                model.lastFetchAt = Date.now();
                model.home.value = home;
                this.SendCommand(new ApplyHallActVisibilityCommand());
                this.SendEvent(new LobbyHomeReadyEvent(home));
                this.SendEvent(new UpdateActCollectOpenEvent(home));
                if (home.tables_in_progress && home.tables_in_progress.length > 0) {
                    void import("../LobbyModule").then((m) => m.openGameAlreadyJoined(home.tables_in_progress));
                }
                void import("../utility/LobbyActivityEnqueue").then((m) => m.onLobbyHomeReady(home));
            })
            .catch((err) => {
                LogKit.W("[FetchHallHomeCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

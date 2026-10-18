import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { TournamentRoute } from "../config/LobbyTopViewConfig";
import type { TournamentDetailRes } from "../config/LobbyTopViewProtocol";

let cachedDetail: import("../config/LobbyTopViewProtocol").TournamentDetailDto | null = null;

export function getCachedTournamentDetail(): import("../config/LobbyTopViewProtocol").TournamentDetailDto | null {
    return cachedDetail;
}

export class FetchTournamentDetailCommand extends AbstractCommand {
    constructor(private readonly tournamentId: number) {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<TournamentDetailRes>(TournamentRoute.Detail, { tournament_id: this.tournamentId })
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[FetchTournamentDetailCommand] code={0}", res.code);
                    return;
                }
                cachedDetail = res.data ?? null;
            })
            .catch((err) => {
                LogKit.W("[FetchTournamentDetailCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

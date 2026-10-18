import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { RankingsRoute } from "../config/RankingsConfig";
import type { HallLobbyRes } from "../config/RankingsProtocol";

export class AckHallRankRewardPopCommand extends AbstractCommand {
    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<HallLobbyRes<{ ok?: number }>>(RankingsRoute.HallRewardPopAck, {})
            .catch((err) => {
                LogKit.W("[AckHallRankRewardPopCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

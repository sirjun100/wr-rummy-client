import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { ChallengerEntryModel } from "../../../../../script/game/challenger/model/ChallengerEntryModel";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { RankingsRoute } from "../config/RankingsConfig";
import type { HallLobbyRes } from "../config/RankingsProtocol";

export class SetHallRankAutoEntryCommand extends AbstractCommand {
    public constructor(private readonly status: number) {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<HallLobbyRes<{ status?: number }>>(RankingsRoute.HallAutoEntry, { status: this.status })
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[SetHallRankAutoEntryCommand] code={0}", res.code);
                    return;
                }
                const st = res.data?.status ?? this.status;
                this.GetModel(ChallengerEntryModel).autoEntry.value = st;
            })
            .catch((err) => {
                LogKit.W(
                    "[SetHallRankAutoEntryCommand] {0}",
                    err instanceof Error ? err.message : String(err),
                );
            });
    }
}

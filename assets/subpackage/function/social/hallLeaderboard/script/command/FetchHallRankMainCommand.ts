import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { ChallengerEntryModel } from "../../../../../script/game/challenger/model/ChallengerEntryModel";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { RankingsRoute } from "../config/RankingsConfig";
import type { HallLobbyRes, HallMainDto } from "../config/RankingsProtocol";
import { RankingsModel } from "../model/RankingsModel";

export class FetchHallRankMainCommand extends AbstractCommand {
    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<HallLobbyRes<HallMainDto>>(RankingsRoute.HallMain, {})
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[FetchHallRankMainCommand] code={0}", res.code);
                    return;
                }
                const data = res.data ?? {};
                const model = this.GetModel(RankingsModel);
                model.mainFrame.value = data;
                if (data.cycle_sn) {
                    model.cycleSn = data.cycle_sn;
                }
                const entry = data.entry_status ?? 0;
                const entryModel = this.GetModel(ChallengerEntryModel);
                entryModel.entryStatus.value = entry;
                entryModel.autoEntry.value = data.auto_entry_status ?? entryModel.autoEntry.value;
            })
            .catch((err) => {
                LogKit.W("[FetchHallRankMainCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

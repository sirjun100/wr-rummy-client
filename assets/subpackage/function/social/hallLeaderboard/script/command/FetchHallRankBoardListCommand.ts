import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { RankingsBoardOrigin, RankingsRoute } from "../config/RankingsConfig";
import type { HallBoardListDto, HallLobbyRes } from "../config/RankingsProtocol";
import { RankingsModel } from "../model/RankingsModel";

export class FetchHallRankBoardListCommand extends AbstractCommand {
    public constructor(
        private readonly page = 1,
        private readonly append = false,
    ) {
        super();
    }

    protected OnExecute(): void {
        const model = this.GetModel(RankingsModel);
        const cycleSn = model.cycleSn || model.mainFrame.value.cycle_sn || 0;
        void this.GetSystem(NetworkSystem)
            .callLobby<HallLobbyRes<HallBoardListDto>>(RankingsRoute.HallRankBoardList, {
                type: model.currentTab,
                cycle_sn: cycleSn,
                page: this.page,
                search_date: model.searchDate || undefined,
                mini_id: model.miniId || undefined,
                origin: RankingsBoardOrigin.Dialog,
            })
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[FetchHallRankBoardListCommand] code={0}", res.code);
                    return;
                }
                const data = res.data ?? {};
                if (data.type && data.type !== model.currentTab) {
                    return;
                }
                model.applyBoardPage(data, this.append);
            })
            .catch((err) => {
                LogKit.W(
                    "[FetchHallRankBoardListCommand] {0}",
                    err instanceof Error ? err.message : String(err),
                );
            });
    }
}

import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { RankingsRoute } from "../config/RankingsConfig";
import type { HallLobbyRes, HallRankDetailDto } from "../config/RankingsProtocol";
import { RankingsModel } from "../model/RankingsModel";

export class FetchHallRankDetailCommand extends AbstractCommand {
    public constructor(private readonly resetList = true) {
        super();
    }

    protected OnExecute(): void {
        const model = this.GetModel(RankingsModel);
        const cycleSn = model.cycleSn || model.mainFrame.value.cycle_sn || 0;
        void this.GetSystem(NetworkSystem)
            .callLobby<HallLobbyRes<HallRankDetailDto>>(RankingsRoute.HallRankDetail, { cycle_sn: cycleSn })
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[FetchHallRankDetailCommand] code={0}", res.code);
                    return;
                }
                const data = res.data ?? {};
                model.rankDetail.value = data;
                if (this.resetList) {
                    model.resetList();
                    const rows: import("../config/RankingsProtocol").RankRowDto[] = [];
                    if (data.my_rank_info) {
                        rows.push(data.my_rank_info);
                    }
                    if (Array.isArray(data.rank_list)) {
                        rows.push(...data.rank_list);
                    }
                    model.listRows.value = rows;
                    model.hasNextPage = data.has_next_page ?? 0;
                    model.curPage = data.page ?? 1;
                }
            })
            .catch((err) => {
                LogKit.W("[FetchHallRankDetailCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

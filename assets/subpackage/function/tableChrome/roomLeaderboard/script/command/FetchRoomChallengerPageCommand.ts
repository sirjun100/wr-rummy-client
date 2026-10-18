import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { HallPlayerModel } from "../../../../hall/hallMenu/script/model/HallPlayerModel";
import { ChallengerRoute, type RankTabType } from "../config/GameActLeaderboardConfig";
import type { RoomChallengerPageRes } from "../config/GameActLeaderboardProtocol";
import { RoomChallengerVisibilityEvent } from "../event/GameActLeaderboardEvents";
import { GameActLeaderboardModel } from "../model/GameActLeaderboardModel";

export class FetchRoomChallengerPageCommand extends AbstractCommand {
    public constructor(
        private readonly vid: number,
        private readonly type: RankTabType = "hour",
        private readonly page = 1,
        private readonly append = false,
    ) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        const model = this.GetModel(GameActLeaderboardModel);
        const isNew = Number(this.GetModel(HallPlayerModel).player.value.is_new_rank ?? 0) === 1;
        const route = isNew ? ChallengerRoute.NewPlayerRoomPage : ChallengerRoute.RoomPage;
        void net
            .callLobby<RoomChallengerPageRes>(route, {
                type: this.type,
                vid: this.vid,
                page: this.page,
                is_click: 1,
            })
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[FetchRoomChallengerPageCommand] code={0}", res.code);
                    return;
                }
                const data = res.data ?? {};
                model.currentVid = this.vid;
                model.currentTab = this.type;
                model.curPage = data.page ?? this.page;
                model.hasNextPage = data.has_next_page ?? 0;
                model.entryStatus.value = data.entry_status ?? 0;
                if (this.page === 1 && this.type === "hour") {
                    model.cacheHourPage(this.vid, data);
                    const show = Number(data.show ?? 0) === 1;
                    this.SendEvent(
                        new RoomChallengerVisibilityEvent(show, String(data.total_reward ?? ""), this.vid),
                    );
                }
                const rows: import("../config/GameActLeaderboardProtocol").RankRowDto[] = [];
                if (this.page === 1 && data.my_rank_info) {
                    rows.push(data.my_rank_info);
                }
                if (Array.isArray(data.rank_list)) {
                    rows.push(...data.rank_list);
                }
                if (this.append && this.page > 1) {
                    model.listRows.value = [...model.listRows.value, ...rows];
                } else {
                    model.listRows.value = rows;
                }
                model.page.value = data;
            })
            .catch((err) => {
                LogKit.W(
                    "[FetchRoomChallengerPageCommand] {0}",
                    err instanceof Error ? err.message : String(err),
                );
            });
    }
}

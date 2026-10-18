import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import type { RoomChallengerPageDto } from "../config/GameActLeaderboardProtocol";

export class GameActLeaderboardModel extends AbstractModel {
    public readonly page = new BindableProperty<RoomChallengerPageDto>({});

    public readonly entryStatus = new BindableProperty<number>(0);

    public readonly listRows = new BindableProperty<import("../config/GameActLeaderboardProtocol").RankRowDto[]>([]);

    public currentVid = 0;

    public currentTab: "hour" | "daily" | "cycle" = "hour";

    public curPage = 1;

    public hasNextPage = 0;

    public readonly roomCache = new Map<number, RoomChallengerPageDto>();

    protected OnInit(): void {}

    public cacheHourPage(vid: number, dto: RoomChallengerPageDto): void {
        if (vid > 0) {
            this.roomCache.set(vid, dto);
        }
    }

    public getCached(vid: number): RoomChallengerPageDto | undefined {
        return this.roomCache.get(vid);
    }

    public clear(): void {
        this.page.value = {};
        this.listRows.value = [];
        this.roomCache.clear();
        this.currentVid = 0;
        this.curPage = 1;
        this.hasNextPage = 0;
    }
}

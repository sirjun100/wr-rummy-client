import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import type {
    HallBoardListDto,
    HallMainDto,
    HallRankDetailDto,
    HallScheduleDto,
} from "../config/RankingsProtocol";
import type { HallRankTabType } from "../config/RankingsConfig";

export class RankingsModel extends AbstractModel {
    public readonly mainFrame = new BindableProperty<HallMainDto>({});
    public readonly rankDetail = new BindableProperty<HallRankDetailDto>({});
    public readonly schedule = new BindableProperty<HallScheduleDto>({});
    public readonly listRows = new BindableProperty<import("../config/RankingsProtocol").RankRowDto[]>([]);

    public cycleSn = 0;
    public currentTab: HallRankTabType = "daily";
    public curPage = 1;
    public hasNextPage = 0;
    public searchDate = "";
    public miniId = 0;

    protected OnInit(): void {}

    public resetList(): void {
        this.curPage = 1;
        this.hasNextPage = 0;
        this.listRows.value = [];
    }

    public applyBoardPage(dto: HallBoardListDto, append: boolean): void {
        this.curPage = dto.page ?? this.curPage;
        this.hasNextPage = dto.has_next_page ?? 0;
        const rows: import("../config/RankingsProtocol").RankRowDto[] = [];
        if (this.curPage === 1 && dto.my_rank_info) {
            rows.push(dto.my_rank_info);
        }
        if (Array.isArray(dto.rank_list)) {
            rows.push(...dto.rank_list);
        }
        if (append && this.curPage > 1) {
            this.listRows.value = [...this.listRows.value, ...rows];
        } else {
            this.listRows.value = rows;
        }
    }
}

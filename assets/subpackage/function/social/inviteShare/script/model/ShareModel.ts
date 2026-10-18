import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import type { EarnRecordDto, RankListDto, SharePageDto } from "../config/ShareConfig";

export type ShareRankState = {
    rankList: RankListDto;
    page: number;
};

export class ShareModel extends AbstractModel {
    public readonly page = new BindableProperty<SharePageDto | null>(null);
    public readonly rank = new BindableProperty<ShareRankState>({
        rankList: {},
        page: -1,
    });
    public readonly earnRecords = new BindableProperty<EarnRecordDto[]>([]);
    public readonly earnHasNext = new BindableProperty<number>(0);
    public readonly earnPage = new BindableProperty<number>(0);
    public readonly hasInviteReward = new BindableProperty<number>(0);

    protected OnInit(): void {}

    public clear(): void {
        this.page.value = null;
        this.rank.value = { rankList: {}, page: -1 };
        this.earnRecords.value = [];
        this.earnHasNext.value = 0;
        this.earnPage.value = 0;
        this.hasInviteReward.value = 0;
    }

    public applyHallFlags(earn: string | undefined, flag: number | undefined): void {
        if (flag !== undefined) {
            this.hasInviteReward.value = flag;
        }
    }
}

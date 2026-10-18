import { AbstractModel, BindableProperty } from "../../../../../../script/framework/QFramework";
import {
    CricketContestListDto,
    CricketCreateTeamCheckDto,
    CricketEnterDto,
    CricketMatchListDto,
    CricketTeamListDto,
} from "../config/CricketProtocol";

export class CricketModel extends AbstractModel {
    public readonly enter = new BindableProperty<CricketEnterDto | null>(null);
    public readonly allMatchList = new BindableProperty<CricketMatchListDto | null>(null);
    public readonly myMatchList = new BindableProperty<CricketMatchListDto | null>(null);
    public readonly allContestList = new BindableProperty<CricketContestListDto | null>(null);
    public readonly myContestList = new BindableProperty<CricketContestListDto | null>(null);
    public readonly teamList = new BindableProperty<CricketTeamListDto | null>(null);
    public readonly createTeamCheck = new BindableProperty<CricketCreateTeamCheckDto | null>(null);
    public readonly curMatchId = new BindableProperty<number>(0);
    public readonly curContestId = new BindableProperty<number>(0);
    public readonly draftTeamIds = new BindableProperty<number[]>([]);
    public readonly draftCaptainId = new BindableProperty<number>(0);
    public readonly draftViceId = new BindableProperty<number>(0);
    public readonly lineUpDotIds = new BindableProperty<number[]>([]);
    public readonly insightCache = new BindableProperty<Record<string, unknown>>({});

    protected OnInit(): void {}

    public setInsightCache(key: string, data: unknown): void {
        const next = { ...this.insightCache.value };
        next[key] = data;
        this.insightCache.value = next;
    }

    public getInsightCache<T = unknown>(key: string): T | undefined {
        return this.insightCache.value[key] as T | undefined;
    }
}

import { _decorator, Label, Node } from "cc";
import { IUIData, UIPanel } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { GameApp } from "../../../../../../script/game/GameApp";
import { FetchCricketMatchListCommand } from "../command/FetchCricketMatchListCommand";
import { FetchCricketMyMatchListCommand } from "../command/FetchCricketMyMatchListCommand";
import { CricketMatchItemDto } from "../config/CricketProtocol";
import { CricketListRefreshEvent } from "../event/CricketEvents";
import { CricketModel } from "../model/CricketModel";
import { CricketGameLogic } from "../CricketGameLogic";
import { CricketUiUtility } from "../utility/CricketUiUtility";

const { ccclass, property } = _decorator;

@ccclass("CricketMainView")
export class CricketMainView extends UIPanel {
    @property(Label)
    public statusLabel: Label | null = null;

    @property(Node)
    public noDataNode: Node | null = null;

    private readonly logic = new CricketGameLogic();
    private curTab = 0;
    private allPage = 1;
    private myPage = 1;
    private sortType = 1;
    private cidFilter = "";
    private allHasNext = 0;
    private myHasNext = 0;

    protected OnInit(_uiData: IUIData = null): void {
        CricketGameLogic.setMainViewOpen(true);
        this.RegisterEvent(CricketListRefreshEvent, () => this.refreshFromModel());
        const model = GameApp.Interface.GetModel(CricketModel);
        model.allMatchList.Register((v) => this.onAllMatches(v)).UnRegisterWhenGameObjectDestroyed(this.Transform);
        model.myMatchList.Register((v) => this.onMyMatches(v)).UnRegisterWhenGameObjectDestroyed(this.Transform);
        model.lineUpDotIds.Register((ids) => this.onLineUpDots(ids)).UnRegisterWhenGameObjectDestroyed(this.Transform);
        model.insightCache.Register((cache) => {
            const push = cache.MatchPush as { dot_ids?: number[] } | undefined;
            if (push?.dot_ids?.length) {
                model.lineUpDotIds.value = push.dot_ids;
            }
        }, this).UnRegisterWhenGameObjectDestroyed(this.Transform);
        this.fetchAll(true);
        this.fetchMy(true);
    }

    protected OnClose(): void {
        CricketGameLogic.setMainViewOpen(false);
    }

    public onAllMatchTabClick(): void {
        this.curTab = 0;
        this.fetchAll(true);
    }

    public onMyMatchTabClick(): void {
        this.curTab = 1;
        this.fetchMy(true);
    }

    public onSortChanged(sortType: number): void {
        this.sortType = sortType;
        this.fetchAll(true);
    }

    public onCidFilterChanged(cid: string): void {
        this.cidFilter = cid;
        this.fetchAll(true);
    }

    public onAllScrollLoadMore(): void {
        if (this.allHasNext !== 1) {
            return;
        }
        this.allPage += 1;
        GameApp.Interface.SendCommand(new FetchCricketMatchListCommand(this.allPage, this.sortType, this.cidFilter));
    }

    public onMyScrollLoadMore(): void {
        if (this.myHasNext !== 1) {
            return;
        }
        this.myPage += 1;
        GameApp.Interface.SendCommand(new FetchCricketMyMatchListCommand(this.myPage));
    }

    public onMatchItemClick(matchId: number): void {
        this.logic.openMatchContests(matchId);
    }

    private fetchAll(reset: boolean): void {
        if (reset) {
            this.allPage = 1;
        }
        GameApp.Interface.SendCommand(new FetchCricketMatchListCommand(this.allPage, this.sortType, this.cidFilter));
    }

    private fetchMy(reset: boolean): void {
        if (reset) {
            this.myPage = 1;
        }
        GameApp.Interface.SendCommand(new FetchCricketMyMatchListCommand(this.myPage));
    }

    private refreshFromModel(): void {
        const model = GameApp.Interface.GetModel(CricketModel);
        if (this.curTab === 0) {
            this.onAllMatches(model.allMatchList.value);
        } else {
            this.onMyMatches(model.myMatchList.value);
        }
    }

    private onAllMatches(data: CricketModel["allMatchList"]["value"]): void {
        this.allHasNext = data?.has_next_page ?? 0;
        const list = (data?.list ?? []) as CricketMatchItemDto[];
        this.updateStatusLabel(list, "all");
        this.checkForceSign(list);
        if (this.noDataNode) {
            this.noDataNode.active = list.length === 0;
        }
    }

    private onMyMatches(data: CricketModel["myMatchList"]["value"]): void {
        this.myHasNext = data?.has_next_page ?? 0;
        const list = (data?.list ?? []) as CricketMatchItemDto[];
        this.updateStatusLabel(list, "my");
        if (this.noDataNode) {
            this.noDataNode.active = this.curTab === 1 && list.length === 0;
        }
    }

    private onLineUpDots(ids: number[]): void {
        if (this.statusLabel && ids.length > 0) {
            this.statusLabel.string = `lineup pending: ${ids.length}`;
        }
    }

    private updateStatusLabel(list: CricketMatchItemDto[], tab: string): void {
        if (!this.statusLabel) {
            return;
        }
        const util = GameApp.Interface.GetUtility(CricketUiUtility);
        const first = list[0];
        const time = first?.start_time_unix ? util.formatStartTime(first.start_time_unix) : "";
        this.statusLabel.string = `${tab} matches: ${list.length} ${time}`;
    }

    private checkForceSign(list: CricketMatchItemDto[]): void {
        for (const item of list) {
            if (item.force === 1 && item.match_id) {
                this.logic.openMatchContests(item.match_id);
                break;
            }
        }
    }
}

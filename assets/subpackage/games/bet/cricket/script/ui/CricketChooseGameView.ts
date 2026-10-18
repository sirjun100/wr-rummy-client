import { _decorator, Label } from "cc";
import { IUIData, UIPanel } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { GameApp } from "../../../../../../script/game/GameApp";
import { FetchCricketAllContestListCommand } from "../command/FetchCricketAllContestListCommand";
import { FetchCricketMyContestListCommand } from "../command/FetchCricketMyContestListCommand";
import { CricketContestItemDto, CricketOpenData } from "../config/CricketProtocol";
import { CricketModel } from "../model/CricketModel";
import { CricketGameLogic } from "../CricketGameLogic";
import { openCricketJoinListDialog, openCricketTeamListView } from "../CricketGameModule";

const { ccclass, property } = _decorator;

@ccclass("CricketChooseGameView")
export class CricketChooseGameView extends UIPanel {
    @property(Label)
    public contestSummary: Label | null = null;

    private readonly logic = new CricketGameLogic();
    private matchId = 0;

    protected OnInit(uiData: IUIData = null): void {
        const data = (uiData as CricketOpenData) ?? {};
        this.matchId = data.match_id ?? 0;
        GameApp.Interface.SendCommand(new FetchCricketAllContestListCommand(this.matchId));
        GameApp.Interface.SendCommand(new FetchCricketMyContestListCommand(this.matchId));
        const model = GameApp.Interface.GetModel(CricketModel);
        model.allContestList.Register((v) => this.renderContests(v?.list as CricketContestItemDto[])).UnRegisterWhenGameObjectDestroyed(
            this.Transform,
        );
    }

    protected OnClose(): void {}

    public onCreateTeamClick(): void {
        this.logic.startCreateTeamFlow(this.matchId);
    }

    public onContestSign(contestId: number, teamId: number): void {
        modelSetContest(contestId);
        this.logic.startSignFlow(this.matchId, contestId, teamId);
    }

    public onOpenTeamList(): void {
        void openCricketTeamListView(this.matchId);
    }

    public onOpenJoinList(): void {
        void openCricketJoinListDialog(this.matchId);
    }

    private renderContests(list: CricketContestItemDto[] | undefined): void {
        if (!this.contestSummary) {
            return;
        }
        const n = list?.length ?? 0;
        const first = list?.[0];
        this.contestSummary.string = n > 0 ? `${first?.name ?? "Contest"} · ₹${first?.entry_fee ?? 0} (${n})` : "No contests";
    }
}

function modelSetContest(contestId: number): void {
    GameApp.Interface.GetModel(CricketModel).curContestId.value = contestId;
}

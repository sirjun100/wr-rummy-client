import { _decorator } from "cc";
import { IUIData, UIPanel } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { GameApp } from "../../../../../../script/game/GameApp";
import { FetchCricketEndTopInfoCommand } from "../command/FetchCricketEndTopInfoCommand";
import { FetchCricketEndLeaderboardCommand } from "../command/FetchCricketEndLeaderboardCommand";
import { CricketOpenData } from "../config/CricketProtocol";
import { CricketModel } from "../model/CricketModel";

const { ccclass } = _decorator;

@ccclass("CricketEndView")
export class CricketEndView extends UIPanel {
    protected OnInit(uiData: IUIData = null): void {
        const data = (uiData as CricketOpenData) ?? {};
        const matchId = data.match_id ?? GameApp.Interface.GetModel(CricketModel).curMatchId.value;
        const contestId = data.contest_id ?? GameApp.Interface.GetModel(CricketModel).curContestId.value;
        GameApp.Interface.SendCommand(new FetchCricketEndTopInfoCommand(matchId));
        if (contestId > 0) {
            GameApp.Interface.SendCommand(new FetchCricketEndLeaderboardCommand(matchId, contestId));
        }
    }

    protected OnClose(): void {}
}

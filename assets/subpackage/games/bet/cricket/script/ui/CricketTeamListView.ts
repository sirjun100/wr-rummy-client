import { _decorator } from "cc";
import { IUIData, UIPanel } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { GameApp } from "../../../../../../script/game/GameApp";
import { FetchCricketTeamListCommand } from "../command/FetchCricketTeamListCommand";
import { CricketModel } from "../model/CricketModel";

const { ccclass } = _decorator;

@ccclass("CricketTeamListView")
export class CricketTeamListView extends UIPanel {
    protected OnInit(_uiData: IUIData = null): void {
        const matchId = GameApp.Interface.GetModel(CricketModel).curMatchId.value;
        GameApp.Interface.SendCommand(new FetchCricketTeamListCommand(matchId));
    }

    protected OnClose(): void {}
}

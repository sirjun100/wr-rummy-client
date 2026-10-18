import { _decorator } from "cc";
import { IUIData, UIPanel } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { GameApp } from "../../../../../../script/game/GameApp";
import { FetchCricketStatTeamCommand } from "../command/FetchCricketStatTeamCommand";
import { CricketModel } from "../model/CricketModel";

const { ccclass } = _decorator;

@ccclass("CricketTeamStatsView")
export class CricketTeamStatsView extends UIPanel {
    protected OnInit(_uiData: IUIData = null): void {
        const matchId = GameApp.Interface.GetModel(CricketModel).curMatchId.value;
        GameApp.Interface.SendCommand(new FetchCricketStatTeamCommand(matchId));
    }

    protected OnClose(): void {}
}

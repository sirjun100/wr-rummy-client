import { _decorator } from "cc";
import { IUIData, UIPanel } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { GameApp } from "../../../../../../script/game/GameApp";
import { FetchCricketBestTeamCommand } from "../command/FetchCricketBestTeamCommand";
import { CricketModel } from "../model/CricketModel";

const { ccclass } = _decorator;

@ccclass("CricketTeamPreviewView")
export class CricketTeamPreviewView extends UIPanel {
    protected OnInit(_uiData: IUIData = null): void {
        const matchId = GameApp.Interface.GetModel(CricketModel).curMatchId.value;
        GameApp.Interface.SendCommand(new FetchCricketBestTeamCommand(matchId));
    }

    protected OnClose(): void {}
}

import { _decorator } from "cc";
import { IUIData, UIPanel } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { GameApp } from "../../../../../../script/game/GameApp";
import { FetchCricketCreateTeamCheckCommand } from "../command/FetchCricketCreateTeamCheckCommand";
import { CricketModel } from "../model/CricketModel";

const { ccclass } = _decorator;

@ccclass("CricketFastCreateTeamView")
export class CricketFastCreateTeamView extends UIPanel {
    protected OnInit(_uiData: IUIData = null): void {
        const matchId = GameApp.Interface.GetModel(CricketModel).curMatchId.value;
        GameApp.Interface.SendCommand(new FetchCricketCreateTeamCheckCommand(matchId));
    }

    protected OnClose(): void {}
}

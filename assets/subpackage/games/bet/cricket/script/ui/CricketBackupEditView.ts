import { _decorator } from "cc";
import { IUIData, UIPanel } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { GameApp } from "../../../../../../script/game/GameApp";
import { FetchCricketBackupPlayerListCommand } from "../command/FetchCricketBackupPlayerListCommand";
import { CricketModel } from "../model/CricketModel";

const { ccclass } = _decorator;

@ccclass("CricketBackupEditView")
export class CricketBackupEditView extends UIPanel {
    protected OnInit(_uiData: IUIData = null): void {
        const matchId = GameApp.Interface.GetModel(CricketModel).curMatchId.value;
        GameApp.Interface.SendCommand(new FetchCricketBackupPlayerListCommand(matchId));
    }

    protected OnClose(): void {}
}

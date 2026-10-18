import { _decorator } from "cc";
import { IUIData, UIPanel } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { GameApp } from "../../../../../../script/game/GameApp";
import { FetchCricketCompareTeamCommand } from "../command/FetchCricketCompareTeamCommand";
import { CricketOpenData } from "../config/CricketProtocol";

const { ccclass } = _decorator;

@ccclass("CricketPlayerTeamCompareView")
export class CricketPlayerTeamCompareView extends UIPanel {
    protected OnInit(uiData: IUIData = null): void {
        GameApp.Interface.SendCommand(new FetchCricketCompareTeamCommand((uiData as CricketOpenData) ?? {}));
    }

    protected OnClose(): void {}
}

import { _decorator } from "cc";
import { IUIData, UIPanel } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { GameApp } from "../../../../../../script/game/GameApp";
import { FetchCricketPkTeamRecentMatchCommand } from "../command/FetchCricketPkTeamRecentMatchCommand";
import { CricketOpenData } from "../config/CricketProtocol";

const { ccclass } = _decorator;

@ccclass("CricketTeamPkMsgView")
export class CricketTeamPkMsgView extends UIPanel {
    protected OnInit(uiData: IUIData = null): void {
        GameApp.Interface.SendCommand(new FetchCricketPkTeamRecentMatchCommand((uiData as CricketOpenData) ?? {}));
    }

    protected OnClose(): void {}
}

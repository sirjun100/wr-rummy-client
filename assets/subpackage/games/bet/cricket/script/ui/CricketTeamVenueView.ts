import { _decorator } from "cc";
import { IUIData, UIPanel } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { GameApp } from "../../../../../../script/game/GameApp";
import { FetchCricketTeamRecentMatchCommand } from "../command/FetchCricketTeamRecentMatchCommand";
import { CricketOpenData } from "../config/CricketProtocol";

const { ccclass } = _decorator;

@ccclass("CricketTeamVenueView")
export class CricketTeamVenueView extends UIPanel {
    protected OnInit(uiData: IUIData = null): void {
        GameApp.Interface.SendCommand(new FetchCricketTeamRecentMatchCommand((uiData as CricketOpenData) ?? {}));
    }

    protected OnClose(): void {}
}

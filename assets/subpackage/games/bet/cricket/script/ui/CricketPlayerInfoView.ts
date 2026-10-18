import { _decorator } from "cc";
import { IUIData, UIPanel } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { GameApp } from "../../../../../../script/game/GameApp";
import { FetchCricketPlayerInfoCommand } from "../command/FetchCricketPlayerInfoCommand";
import { CricketOpenData } from "../config/CricketProtocol";

const { ccclass } = _decorator;

@ccclass("CricketPlayerInfoView")
export class CricketPlayerInfoView extends UIPanel {
    protected OnInit(uiData: IUIData = null): void {
        const d = (uiData as CricketOpenData & { player_id?: number }) ?? {};
        if (d.match_id && d.player_id) {
            GameApp.Interface.SendCommand(new FetchCricketPlayerInfoCommand(d.match_id, d.player_id));
        }
    }

    protected OnClose(): void {}
}

import { _decorator } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../../script/game/controller/engine/BaseDialog";
import { IUIData } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { FetchCricketEndWinningsCommand } from "../../command/FetchCricketEndWinningsCommand";
import { CricketOpenData } from "../../config/CricketProtocol";

const { ccclass } = _decorator;

@ccclass("CricketEndRewardDialog")
export class CricketEndRewardDialog extends BaseDialog {
    protected OnInit(uiData: IUIData = null): void {
        const data = (uiData as CricketOpenData) ?? {};
        if (data.match_id && data.contest_id) {
            GameApp.Interface.SendCommand(new FetchCricketEndWinningsCommand(data.match_id, data.contest_id));
        }
    }

    protected OnClose(): void {}
}

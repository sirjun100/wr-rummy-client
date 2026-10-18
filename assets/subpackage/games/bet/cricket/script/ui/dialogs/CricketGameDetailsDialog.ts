import { _decorator } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../../script/game/controller/engine/BaseDialog";
import { IUIData } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { FetchCricketAllContestListCommand } from "../../command/FetchCricketAllContestListCommand";
import { CricketOpenData } from "../../config/CricketProtocol";

const { ccclass } = _decorator;

@ccclass("CricketGameDetailsDialog")
export class CricketGameDetailsDialog extends BaseDialog {
    protected OnInit(uiData: IUIData = null): void {
        const data = (uiData as CricketOpenData) ?? {};
        if (data.match_id) {
            GameApp.Interface.SendCommand(new FetchCricketAllContestListCommand(data.match_id));
        }
    }

    protected OnClose(): void {}
}

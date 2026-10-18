import { _decorator } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../../script/game/controller/engine/BaseDialog";
import { IUIData } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { FetchCricketCheckJoinTeamListCommand } from "../../command/FetchCricketCheckJoinTeamListCommand";
import { FetchCricketJoinTeamListCommand } from "../../command/FetchCricketJoinTeamListCommand";
import { CricketOpenData } from "../../config/CricketProtocol";
import { CricketModel } from "../../model/CricketModel";

const { ccclass } = _decorator;

@ccclass("CricketJoinListDialog")
export class CricketJoinListDialog extends BaseDialog {
    private matchId = 0;

    protected OnInit(uiData: IUIData = null): void {
        const data = (uiData as CricketOpenData) ?? {};
        this.matchId = data.match_id ?? GameApp.Interface.GetModel(CricketModel).curMatchId.value;
        GameApp.Interface.SendCommand(new FetchCricketJoinTeamListCommand(this.matchId));
        GameApp.Interface.SendCommand(
            new FetchCricketCheckJoinTeamListCommand({ match_id: this.matchId }),
        );
    }

    protected OnClose(): void {}
}

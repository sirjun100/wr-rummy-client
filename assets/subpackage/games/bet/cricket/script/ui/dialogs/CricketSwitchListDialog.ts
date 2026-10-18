import { _decorator } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../../script/game/controller/engine/BaseDialog";
import { IUIData } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { FetchCricketSwitchTeamListCommand } from "../../command/FetchCricketSwitchTeamListCommand";
import { SwitchCricketTeamCommand } from "../../command/SwitchCricketTeamCommand";
import { CricketOpenData } from "../../config/CricketProtocol";

const { ccclass } = _decorator;

@ccclass("CricketSwitchListDialog")
export class CricketSwitchListDialog extends BaseDialog {
    private payload: CricketOpenData = {};

    protected OnInit(uiData: IUIData = null): void {
        this.payload = (uiData as CricketOpenData) ?? {};
        const matchId = this.payload.match_id ?? 0;
        if (matchId > 0) {
            GameApp.Interface.SendCommand(new FetchCricketSwitchTeamListCommand(matchId));
        }
    }

    public onSwitchTeam(fromTeamId: number, toTeamId: number): void {
        const { match_id: matchId = 0, contest_id: contestId = 0 } = this.payload;
        GameApp.Interface.SendCommand(new SwitchCricketTeamCommand(matchId, contestId, fromTeamId, toTeamId));
        this.CloseSelf();
    }

    protected OnClose(): void {}
}

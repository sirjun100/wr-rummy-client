import { _decorator } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../../script/game/controller/engine/BaseDialog";
import { IUIData } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { SignCricketContestCommand } from "../../command/SignCricketContestCommand";
import { CricketOpenData } from "../../config/CricketProtocol";
import { CricketSignSuccessEvent } from "../../event/CricketEvents";

const { ccclass } = _decorator;

@ccclass("CricketAssureJoinDialog")
export class CricketAssureJoinDialog extends BaseDialog {
    private payload: CricketOpenData = {};

    protected OnInit(uiData: IUIData = null): void {
        this.payload = (uiData as CricketOpenData) ?? {};
        this.RegisterEvent(CricketSignSuccessEvent, () => this.CloseSelf());
    }

    public onConfirmClick(): void {
        const { match_id: matchId = 0, contest_id: contestId = 0, team_id: teamId = 0 } = this.payload;
        GameApp.Interface.SendCommand(new SignCricketContestCommand(matchId, contestId, teamId));
    }

    protected OnClose(): void {}
}

import { _decorator } from "cc";
import { IUIData, UIPanel } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { GameApp } from "../../../../../../script/game/GameApp";
import { CreateCricketTeamCommand } from "../command/CreateCricketTeamCommand";
import { CricketCloseCreateTeamFlowEvent } from "../event/CricketEvents";
import { CricketModel } from "../model/CricketModel";

const { ccclass } = _decorator;

@ccclass("CricketCaptainSelectView")
export class CricketCaptainSelectView extends UIPanel {
    protected OnInit(_uiData: IUIData = null): void {
        this.RegisterEvent(CricketCloseCreateTeamFlowEvent, () => this.Close());
    }

    protected OnClose(): void {}

    public setCaptain(playerId: number): void {
        GameApp.Interface.GetModel(CricketModel).draftCaptainId.value = playerId;
    }

    public setViceCaptain(playerId: number): void {
        GameApp.Interface.GetModel(CricketModel).draftViceId.value = playerId;
    }

    public onConfirmTeam(): void {
        const model = GameApp.Interface.GetModel(CricketModel);
        const matchId = model.curMatchId.value;
        const players = model.draftTeamIds.value;
        const captain = model.draftCaptainId.value;
        const vice = model.draftViceId.value;
        GameApp.Interface.SendCommand(
            new CreateCricketTeamCommand(matchId, "Team", players, captain, vice, []),
        );
    }
}

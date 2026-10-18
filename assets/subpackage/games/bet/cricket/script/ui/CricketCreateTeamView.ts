import { _decorator, Label } from "cc";
import { IUIData, UIPanel } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { GameApp } from "../../../../../../script/game/GameApp";
import { FetchCricketCreateTeamCheckCommand } from "../command/FetchCricketCreateTeamCheckCommand";
import { CricketOpenData, CricketPlayerTpl } from "../config/CricketProtocol";
import { openCricketCaptainSelectView } from "../CricketGameModule";
import { CricketModel } from "../model/CricketModel";
import { CricketTeamUtility } from "../utility/CricketTeamUtility";

const { ccclass, property } = _decorator;

@ccclass("CricketCreateTeamView")
export class CricketCreateTeamView extends UIPanel {
    @property(Label)
    public creditLabel: Label | null = null;

    private matchId = 0;
    private selected: number[] = [];

    protected OnInit(uiData: IUIData = null): void {
        const data = (uiData as CricketOpenData) ?? {};
        this.matchId = data.match_id ?? 0;
        GameApp.Interface.SendCommand(new FetchCricketCreateTeamCheckCommand(this.matchId));
        const model = GameApp.Interface.GetModel(CricketModel);
        model.createTeamCheck.Register((check) => this.onPool(check)).UnRegisterWhenGameObjectDestroyed(this.Transform);
        model.draftTeamIds.value = [];
    }

    protected OnClose(): void {}

    public togglePlayer(playerId: number): void {
        const idx = this.selected.indexOf(playerId);
        if (idx >= 0) {
            this.selected.splice(idx, 1);
        } else if (this.selected.length < 11) {
            this.selected.push(playerId);
        }
        const model = GameApp.Interface.GetModel(CricketModel);
        model.draftTeamIds.value = [...this.selected];
        this.refreshCredits();
    }

    public onNextCaptainSelect(): void {
        if (this.selected.length !== 11) {
            return;
        }
        void openCricketCaptainSelectView();
    }

    private onPool(check: CricketModel["createTeamCheck"]["value"]): void {
        if (!check?.player_list) {
            return;
        }
        this.refreshCredits(check.player_list, check.credit_cap);
    }

    private refreshCredits(pool?: CricketPlayerTpl[], cap?: number): void {
        if (!this.creditLabel) {
            return;
        }
        const util = GameApp.Interface.GetUtility(CricketTeamUtility);
        const sum = util.sumCredits(pool ?? [], this.selected);
        this.creditLabel.string = `Credits ${sum}/${cap ?? 100}`;
    }
}

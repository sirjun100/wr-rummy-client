import { _decorator, Component, Label } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { RocketModel } from "../model/RocketModel";

const { ccclass, property } = _decorator;

@ccclass("RocketTrendPanel")
export class RocketTrendPanel extends Component {
    @property(Label)
    public trendText: Label | null = null;

    protected onLoad(): void {
        const model = GameApp.Interface.GetModel(RocketModel);
        model.table.RegisterWithInitValue((t) => {
            if (!t?.history_record || !this.trendText) {
                return;
            }
            this.trendText.string = t.history_record
                .slice(-8)
                .map((h) => h.win_rate ?? "")
                .join(" ");
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
    }
}

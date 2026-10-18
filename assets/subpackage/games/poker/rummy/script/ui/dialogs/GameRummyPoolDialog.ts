import { _decorator, Label } from "cc";
import { BaseDialog } from "../../../../../../../script/game/controller/engine/BaseDialog";
import { GameApp } from "../../../../../../../script/game/GameApp";
import { RummyModel } from "../../model/RummyModel";

const { ccclass, property } = _decorator;

@ccclass("GameRummyPoolDialog")
export class GameRummyPoolDialog extends BaseDialog {
    @property(Label)
    public scoresLabel: Label | null = null;

    protected onLoad(): void {
        const pool = GameApp.Interface.GetModel(RummyModel).table.value?.pool_scores;
        if (this.scoresLabel && pool) {
            this.scoresLabel.string = JSON.stringify(pool);
        }
    }
}

import { _decorator, Label } from "cc";
import { BaseDialog } from "../../../../../../../script/game/controller/engine/BaseDialog";
import { GameApp } from "../../../../../../../script/game/GameApp";
import { RummyModel } from "../../model/RummyModel";

const { ccclass, property } = _decorator;

@ccclass("GameRummyDealsRecordDialog")
export class GameRummyDealsRecordDialog extends BaseDialog {
    @property(Label)
    public chipsLabel: Label | null = null;

    protected onLoad(): void {
        const chips = GameApp.Interface.GetModel(RummyModel).table.value?.chips;
        if (this.chipsLabel && chips) {
            this.chipsLabel.string = JSON.stringify(chips);
        }
    }
}

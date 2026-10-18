import { _decorator, Component, Label } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { RummyTableUpdatedEvent } from "../event/RummyEvents";
import { RummyModel } from "../model/RummyModel";

const { ccclass, property } = _decorator;

@ccclass("RummyPlayerPanel")
export class RummyPlayerPanel extends Component {
    @property(Label)
    public seatsLabel: Label | null = null;

    protected onLoad(): void {
        GameApp.Interface.RegisterEvent(RummyTableUpdatedEvent, this.onTable, this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
    }

    private onTable(): void {
        const t = GameApp.Interface.GetModel(RummyModel).table.value;
        if (!t || !this.seatsLabel) {
            return;
        }
        const parts = (t.players ?? []).map((p) => `${p.uid}${p.dropped ? "(d)" : ""}`);
        this.seatsLabel.string = parts.join(" | ");
    }
}

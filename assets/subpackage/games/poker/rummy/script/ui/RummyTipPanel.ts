import { _decorator, Component, Label } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { RummyTableUpdatedEvent, RummyTurnEvent } from "../event/RummyEvents";
import { RummyModel } from "../model/RummyModel";

const { ccclass, property } = _decorator;

@ccclass("RummyTipPanel")
export class RummyTipPanel extends Component {
    @property(Label)
    public cdLabel: Label | null = null;

    @property(Label)
    public wildLabel: Label | null = null;

    protected onLoad(): void {
        GameApp.Interface.RegisterEvent(RummyTurnEvent, this.onTurn, this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        GameApp.Interface.RegisterEvent(RummyTableUpdatedEvent, () => {
            const v = GameApp.Interface.GetModel(RummyModel).table.value;
            if (this.wildLabel && v) {
                this.wildLabel.string = `Wild: ${v.wild_rank}`;
            }
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private turnLeft = 0;

    private onTurn(e: RummyTurnEvent): void {
        this.turnLeft = e.cd;
        this.updateCdLabel();
    }

    protected update(dt: number): void {
        if (this.turnLeft > 0) {
            this.turnLeft = Math.max(0, this.turnLeft - dt);
            this.updateCdLabel();
            if (this.turnLeft <= 0) {
                globalThis.wrUi?.showToast?.("Turn timeout");
            }
        }
    }

    private updateCdLabel(): void {
        if (this.cdLabel) {
            this.cdLabel.string = `${Math.ceil(this.turnLeft)}s`;
        }
    }
}

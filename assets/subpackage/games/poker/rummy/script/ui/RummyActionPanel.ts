import { _decorator, Button, Component, find } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { SessionModel } from "../../../../../../script/game/model/SessionModel";
import { RummyDeclareCheckCommand } from "../command/RummyDeclareCheckCommand";
import { RummyPlayCommand } from "../command/RummyPlayCommand";
import { RummyStartHandCommand } from "../command/RummyStartHandCommand";
import { RummyTableUpdatedEvent } from "../event/RummyEvents";
import { RummyModel } from "../model/RummyModel";

const { ccclass } = _decorator;

@ccclass("RummyActionPanel")
export class RummyActionPanel extends Component {
    private selectedCardId = 0;

    protected onLoad(): void {
        this.wireButton("drop_btn", () => this.SendCommand(new RummyPlayCommand("drop")));
        this.wireButton("btn_drop", () => this.SendCommand(new RummyPlayCommand("drop")));
        this.wireButton("draw_closed_btn", () => this.SendCommand(new RummyPlayCommand("draw_closed")));
        this.wireButton("draw_open_btn", () => this.SendCommand(new RummyPlayCommand("draw_open")));
        this.wireButton("start_btn", () => this.SendCommand(new RummyStartHandCommand()));
        this.wireButton("finish_btn", () => {
            if (this.selectedCardId > 0) {
                this.SendCommand(new RummyDeclareCheckCommand(this.selectedCardId));
                this.SendCommand(new RummyPlayCommand("declare", this.selectedCardId));
            }
        });
        GameApp.Interface.RegisterEvent(RummyTableUpdatedEvent, () => this.refresh(), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
    }

    public setSelectedCard(cardId: number): void {
        this.selectedCardId = cardId;
    }

    private wireButton(name: string, fn: () => void): void {
        const n = find(name, this.node);
        const btn = n?.getComponent(Button);
        if (btn) {
            btn.node.on(Button.EventType.CLICK, fn, this);
        }
    }

    private refresh(): void {
        const myTurn = this.isMyTurn();
        const phase = GameApp.Interface.GetModel(RummyModel).table.value?.phase ?? "";
        const draw = phase === "turn_draw" && myTurn;
        const discard = phase === "turn_discard" && myTurn;
        this.setBtnActive("draw_closed_btn", draw);
        this.setBtnActive("draw_open_btn", draw);
        this.setBtnActive("drop_btn", myTurn);
        this.setBtnActive("btn_drop", myTurn);
        this.setBtnActive("finish_btn", discard);
    }

    private setBtnActive(name: string, on: boolean): void {
        const n = find(name, this.node);
        if (n) {
            n.active = on;
        }
    }

    private isMyTurn(): boolean {
        const uid = GameApp.Interface.GetModel(SessionModel).uid;
        const turn = GameApp.Interface.GetModel(RummyModel).table.value?.turn_uid ?? 0;
        return uid > 0 && uid === turn;
    }

    private SendCommand(cmd: RummyPlayCommand | RummyStartHandCommand | RummyDeclareCheckCommand): void {
        GameApp.Interface.SendCommand(cmd);
    }
}

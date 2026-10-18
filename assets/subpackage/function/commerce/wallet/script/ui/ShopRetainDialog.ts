import { _decorator, Label } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { AckShopRetainCommand } from "../../../../../script/game/commerce/command/AckShopRetainCommand";
import { PaymentModel } from "../../../../../script/game/commerce/model/PaymentModel";
import { PaymentDialogBase } from "./PaymentDialogBase";

const { ccclass, property } = _decorator;

@ccclass("ShopRetainDialog")
export class ShopRetainDialog extends PaymentDialogBase {
    @property(Label)
    public timerLabel: Label = null;

    private onLeave: (() => void) | null = null;
    private leftSec = 0;
    protected OnInit(onLeave: (() => void) | null = null): void {
        this.onLeave = onLeave;
        this.leftSec = GameApp.Interface.GetModel(PaymentModel).shopPage.value.retain_seconds ?? 30;
        this.refreshTimer();
        this.schedule(this.onSchedule, 1);
        this.wireByName("btn_stay", () => {
            GameApp.Interface.SendCommand(new AckShopRetainCommand());
            this.CloseSelf();
        });
        this.wireByName("btn_leave", () => {
            this.onLeave?.();
            this.CloseSelf();
        });
    }

    private onSchedule = (): void => {
        this.leftSec -= 1;
        this.refreshTimer();
        if (this.leftSec <= 0) {
            this.unschedule(this.onSchedule);
        }
    };

    private refreshTimer(): void {
        if (this.timerLabel) {
            this.timerLabel.string = String(Math.max(0, this.leftSec));
        }
    }

    protected OnClose(): void {
        this.unschedule(this.onSchedule);
    }
}

import { _decorator, Label } from "cc";
import { BaseDialog } from "../../../../../../../script/game/controller/engine/BaseDialog";

const { ccclass, property } = _decorator;

@ccclass("RummyGameOverDialog")
export class RummyGameOverDialog extends BaseDialog {
    @property(Label)
    public resultLabel: Label | null = null;

    public bindResult(winner: number, penalties: Record<string, number>, myUid: number): void {
        if (!this.resultLabel) {
            return;
        }
        const mine = penalties[String(myUid)] ?? penalties[myUid as unknown as string] ?? 0;
        const win = winner === myUid;
        this.resultLabel.string = win ? "You win!" : `Winner ${winner}, penalty ${mine}`;
    }
}

import { _decorator } from "cc";
import { BaseDialog } from "../../../../../../script/game/controller/engine/BaseDialog";

const { ccclass } = _decorator;

/** P1: multi-table add room shell (legacy RummyAddRoom). */
@ccclass("AddRoomDialog")
export class AddRoomDialog extends BaseDialog {
    protected OnInit(): void {
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("close", () => this.CloseSelf());
    }

    protected OnClose(): void {}

    private wireByName(name: string, fn: () => void): void {
        const stack = [this.node];
        while (stack.length) {
            const n = stack.pop()!;
            if (n.name === name) {
                n.on("click", fn, this);
            }
            for (const c of n.children) {
                stack.push(c);
            }
        }
    }
}

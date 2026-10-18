import { _decorator, Button, Label } from "cc";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";

const { ccclass, property } = _decorator;

export type HelpAlertUiData = { tips?: string };

@ccclass("HelpAlertDialog")
export class HelpAlertDialog extends BaseDialog {
    @property(Label)
    public tipsLabel: Label = null;

    protected OnInit(): void {
        const data = (this.uiData ?? {}) as HelpAlertUiData;
        const text = data.tips ?? "";
        if (this.tipsLabel) {
            this.tipsLabel.string = text;
        } else {
            const stack: import("cc").Node[] = [this.node];
            while (stack.length) {
                const n = stack.pop()!;
                const lab = n.getComponent(Label);
                if (lab && (n.name === "tips" || n.name === "content")) {
                    lab.string = text;
                    break;
                }
                for (const c of n.children) {
                    stack.push(c);
                }
            }
        }
        this.wireCloseByName("btn_close");
        this.wireCloseByName("close_btn");
        this.wireCloseByName("mask");
    }

    private wireCloseByName(name: string): void {
        const stack: import("cc").Node[] = [this.node];
        while (stack.length) {
            const n = stack.pop()!;
            if (n.name === name) {
                n.on(Button.EventType.CLICK, () => this.CloseSelf(), this);
            }
            for (const c of n.children) {
                stack.push(c);
            }
        }
    }

    protected OnClose(): void {}
}

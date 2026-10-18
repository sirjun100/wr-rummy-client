import { _decorator, Button, Label } from "cc";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";

const { ccclass, property } = _decorator;

export type MenuAlertUiData = {
    title?: string;
    content?: string;
    onOk?: () => void;
    onCancel?: () => void;
    withCancel?: boolean;
};

@ccclass("MenuAlertDialog")
export class MenuAlertDialog extends BaseDialog {
    @property(Label)
    public titleLabel: Label = null;

    @property(Label)
    public contentLabel: Label = null;

    protected OnInit(): void {
        const data = (this.uiData ?? {}) as MenuAlertUiData;
        const title = data.title ?? "";
        const content = data.content ?? "";
        if (this.titleLabel) {
            this.titleLabel.string = title;
        }
        if (this.contentLabel) {
            this.contentLabel.string = content;
        }
        this.fillLabelByName("title", title);
        this.fillLabelByName("content", content);
        this.fillLabelByName("tips", content);
        this.wireBtn("ok_btn", () => {
            data.onOk?.();
            this.CloseSelf();
        });
        this.wireBtn("btn_ok", () => {
            data.onOk?.();
            this.CloseSelf();
        });
        if (data.withCancel) {
            this.wireBtn("cancel_btn", () => {
                data.onCancel?.();
                this.CloseSelf();
            });
            this.wireBtn("btn_cancel", () => {
                data.onCancel?.();
                this.CloseSelf();
            });
        }
    }

    private fillLabelByName(name: string, text: string): void {
        const stack: import("cc").Node[] = [this.node];
        while (stack.length) {
            const n = stack.pop()!;
            if (n.name === name) {
                const lab = n.getComponent(Label);
                if (lab) {
                    lab.string = text;
                }
            }
            for (const c of n.children) {
                stack.push(c);
            }
        }
    }

    private wireBtn(name: string, fn: () => void): void {
        const stack: import("cc").Node[] = [this.node];
        while (stack.length) {
            const n = stack.pop()!;
            if (n.name === name && n.getComponent(Button)) {
                n.off(Button.EventType.CLICK);
                n.on(Button.EventType.CLICK, fn, this);
            }
            for (const c of n.children) {
                stack.push(c);
            }
        }
    }

    protected OnClose(): void {}
}

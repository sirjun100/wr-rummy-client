import { _decorator, Label } from "cc";
import { BaseDialog } from "../../controller/engine/BaseDialog";

const { ccclass, property } = _decorator;

@ccclass("ForceUpdateDialog")
export class ForceUpdateDialog extends BaseDialog {
    @property(Label)
    public messageLabel: Label = null;

    public setMessage(text: string): void {
        if (this.messageLabel) {
            this.messageLabel.string = text;
        }
    }
}

import { _decorator, Component, EditBox, Node } from "cc";

const { ccclass, property } = _decorator;

/** Reusable secure numeric keyboard for wallet inputs. */
@ccclass("LetterKeyboard")
export class LetterKeyboardWidget extends Component {
    @property(EditBox)
    public targetEdit: EditBox = null;

    protected onLoad(): void {
        for (let d = 0; d <= 9; d++) {
            const key = this.node.getChildByName(`key_${d}`);
            key?.on(Node.EventType.TOUCH_END, () => this.append(String(d)), this);
        }
        this.node.getChildByName("key_delete")?.on(Node.EventType.TOUCH_END, () => this.backspace(), this);
    }

    private append(ch: string): void {
        if (!this.targetEdit) {
            return;
        }
        this.targetEdit.string = `${this.targetEdit.string}${ch}`;
    }

    private backspace(): void {
        if (!this.targetEdit) {
            return;
        }
        this.targetEdit.string = this.targetEdit.string.slice(0, -1);
    }
}

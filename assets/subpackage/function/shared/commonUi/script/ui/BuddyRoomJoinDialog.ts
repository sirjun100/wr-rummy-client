import { _decorator, EditBox, Label } from "cc";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import type { BuddyJoinUiData } from "../config/PublicProtocol";
import { findNodeByName, wireButtonByName } from "../utility/PublicDialogUtil";

const { ccclass } = _decorator;

@ccclass("BuddyRoomJoinDialog")
export class BuddyRoomJoinDialog extends BaseDialog {
    private editBox: EditBox | null = null;

    protected OnInit(): void {
        const data = (this.uiData ?? {}) as BuddyJoinUiData;
        wireButtonByName(this.node, "close", () => this.CloseSelf(), this);
        wireButtonByName(this.node, "close_big", () => this.CloseSelf(), this);
        const bg = findNodeByName(this.node, "number_bg");
        if (bg) {
            this.editBox = bg.getComponent(EditBox) ?? bg.addComponent(EditBox);
            this.editBox.maxLength = 6;
            this.editBox.inputMode = EditBox.InputMode.NUMERIC;
            this.editBox.node.on(EditBox.EventType.TEXT_CHANGED, this.refreshDigits, this);
        }
        wireButtonByName(this.node, "btn_delete", () => {
            if (this.editBox) {
                this.editBox.string = this.editBox.string.slice(0, -1);
                this.refreshDigits();
            }
        }, this);
        wireButtonByName(this.node, "btn_jon", () => {
            const code = (this.editBox?.string ?? "").trim();
            if (code.length > 0) {
                data.onSubmit?.(code);
            }
            this.CloseSelf();
        }, this);
        this.refreshDigits();
    }

    private refreshDigits(): void {
        const code = this.editBox?.string ?? "";
        for (let i = 1; i <= 6; i++) {
            const n = findNodeByName(this.node, `num_${i}`);
            const lab = n?.getComponent(Label);
            if (lab) {
                lab.string = code[i - 1] ?? "";
            }
        }
    }

    protected OnClose(): void {
        this.editBox?.node.off(EditBox.EventType.TEXT_CHANGED, this.refreshDigits, this);
    }
}

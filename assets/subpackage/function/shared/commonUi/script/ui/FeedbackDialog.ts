import { _decorator, EditBox } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import type { FeedbackSubmitReq } from "../config/PublicProtocol";
import { ensurePublicRegistered } from "../PublicModule";
import { SubmitFeedbackCommand } from "../command/SubmitFeedbackCommand";
import { findNodeByName, wireButtonByName } from "../utility/PublicDialogUtil";

const { ccclass } = _decorator;

@ccclass("FeedbackDialog")
export class FeedbackDialog extends BaseDialog {
    private editBox: EditBox | null = null;

    protected OnInit(): void {
        const defaults = (this.uiData ?? {}) as Partial<FeedbackSubmitReq>;
        this.editBox = findNodeByName(this.node, "edit_box")?.getComponent(EditBox) ?? null;
        wireButtonByName(this.node, "close_btn", () => this.CloseSelf(), this);
        wireButtonByName(this.node, "del_btn", () => {
            if (this.editBox) {
                this.editBox.string = "";
            }
        }, this);
        wireButtonByName(this.node, "submit_btn", () => this.submit(defaults.scene), this);
    }

    private submit(scene?: string): void {
        const content = this.editBox?.string ?? "";
        ensurePublicRegistered();
        GameApp.Interface.SendCommand(
            new SubmitFeedbackCommand({ scene: scene ?? "feedback", content, contact: "" }),
        );
        this.CloseSelf();
    }

    protected OnClose(): void {}
}

import { _decorator, Label } from "cc";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import type { CommonAlertUiData } from "../config/PublicProtocol";
import { applyLandscape, setLabelOnNode, wireButtonByName } from "../utility/PublicDialogUtil";

const { ccclass, property } = _decorator;

@ccclass("CommonDialogDialog")
export class CommonDialogDialog extends BaseDialog {
    @property(Label)
    public titleLabel: Label = null;

    @property(Label)
    public contentLabel: Label = null;

    protected OnInit(): void {
        const data = (this.uiData ?? {}) as CommonAlertUiData;
        applyLandscape(this.node, data.landscape);
        const title = data.title ?? "";
        const content = data.content ?? "";
        if (this.titleLabel) {
            this.titleLabel.string = title;
        }
        if (this.contentLabel) {
            this.contentLabel.string = content;
        }
        setLabelOnNode(this.node, "title", title);
        setLabelOnNode(this.node, "content", content);
        setLabelOnNode(this.node, "richcontent", content);
        const ok = () => {
            data.onOk?.();
            this.CloseSelf();
        };
        const cancel = () => {
            data.onCancel?.();
            this.CloseSelf();
        };
        wireButtonByName(this.node, "ok", ok, this);
        wireButtonByName(this.node, "sure", ok, this);
        wireButtonByName(this.node, "close", () => this.CloseSelf(), this);
        const cancelNode = data.withCancel;
        wireButtonByName(this.node, "cancel", cancel, this);
        if (!cancelNode) {
            const cancelBtn = this.node.getChildByName("cancel");
            cancelBtn?.active = false;
        }
    }

    protected OnClose(): void {}
}

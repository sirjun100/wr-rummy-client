import { _decorator } from "cc";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import type { MatchAlertUiData } from "../config/PublicProtocol";
import { setLabelOnNode, wireButtonByName } from "../utility/PublicDialogUtil";

const { ccclass } = _decorator;

@ccclass("MatchAlertDialog")
export class MatchAlertDialog extends BaseDialog {
    protected OnInit(): void {
        const data = (this.uiData ?? {}) as MatchAlertUiData;
        setLabelOnNode(this.node, "title", data.title ?? "");
        setLabelOnNode(this.node, "tips_tx", data.tips ?? "");
        wireButtonByName(this.node, "btn_enter", () => {
            data.onEnter?.();
            this.CloseSelf();
        }, this);
        wireButtonByName(this.node, "btn_cancel", () => {
            data.onCancel?.();
            this.CloseSelf();
        }, this);
        wireButtonByName(this.node, "btn_close", () => this.CloseSelf(), this);
    }

    protected OnClose(): void {}
}

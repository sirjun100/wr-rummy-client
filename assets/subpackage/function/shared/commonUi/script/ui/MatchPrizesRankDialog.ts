import { _decorator, Label } from "cc";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import type { MatchPrizesRankUiData } from "../config/PublicProtocol";
import { findNodeByName, setLabelOnNode, wireButtonByName } from "../utility/PublicDialogUtil";

const { ccclass } = _decorator;

@ccclass("MatchPrizesRankDialog")
export class MatchPrizesRankDialog extends BaseDialog {
    protected OnInit(): void {
        const data = (this.uiData ?? {}) as MatchPrizesRankUiData;
        setLabelOnNode(this.node, "title", data.title ?? "");
        setLabelOnNode(this.node, "prize", data.prizeLabel ?? "");
        const content = findNodeByName(this.node, "content");
        if (content && data.rows?.length) {
            const lines = data.rows.map((r) => `${r.rank ?? "-"}  ${r.name ?? ""}  ${r.score ?? ""}`);
            const lab = content.getComponent(Label);
            if (lab) {
                lab.string = lines.join("\n");
            }
        }
        wireButtonByName(this.node, "btn_close", () => this.CloseSelf(), this);
        wireButtonByName(this.node, "close_btn", () => this.CloseSelf(), this);
    }

    protected OnClose(): void {}
}

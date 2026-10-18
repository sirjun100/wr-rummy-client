import { _decorator, Label } from "cc";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import type { RewardTipsUiData } from "../config/PublicProtocol";
import { setLabelOnNode, wireButtonByName } from "../utility/PublicDialogUtil";

const { ccclass } = _decorator;

@ccclass("RewardTipsDialog")
export class RewardTipsDialog extends BaseDialog {
    protected OnInit(): void {
        const data = (this.uiData ?? {}) as RewardTipsUiData;
        setLabelOnNode(this.node, "richtips", data.tips ?? "");
        setLabelOnNode(this.node, "tips1", data.rewards?.[0]?.name ?? "");
        setLabelOnNode(this.node, "tips2", data.rewards?.[1]?.name ?? "");
        setLabelOnNode(this.node, "tips3", data.rewards?.[2]?.name ?? "");
        const stack = [this.node];
        let rewardIdx = 0;
        while (stack.length && rewardIdx < (data.rewards?.length ?? 0)) {
            const n = stack.pop()!;
            if (n.name === "name") {
                const lab = n.getComponent(Label);
                if (lab) {
                    const row = data.rewards![rewardIdx];
                    lab.string = `${row.name ?? ""} ${row.amount ?? ""}`.trim();
                    rewardIdx++;
                }
            }
            for (const c of n.children) {
                stack.push(c);
            }
        }
        wireButtonByName(this.node, "assure_btn", () => {
            data.onConfirm?.();
            this.CloseSelf();
        }, this);
        wireButtonByName(this.node, "cancel_btn", () => {
            data.onCancel?.();
            this.CloseSelf();
        }, this);
        wireButtonByName(this.node, "close_btn", () => this.CloseSelf(), this);
    }

    protected OnClose(): void {}
}

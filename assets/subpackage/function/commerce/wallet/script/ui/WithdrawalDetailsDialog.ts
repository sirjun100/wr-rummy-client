import { _decorator, Label, Node } from "cc";
import { PaymentUtility } from "../../../../../script/game/commerce/utility/PaymentUtility";
import { PaymentDialogBase } from "./PaymentDialogBase";

const { ccclass, property } = _decorator;

export type WithdrawalDetailsData = {
    withdrawId?: string | number;
    amount?: number;
    status?: string;
    process?: string[];
};

@ccclass("WithdrawalDetailsDialog")
export class WithdrawalDetailsDialog extends PaymentDialogBase {
    @property(Label)
    public withdrawIdLabel: Label = null;

    @property(Label)
    public amountLabel: Label = null;

    @property(Label)
    public statusLabel: Label = null;

    @property(Node)
    public timelineRoot: Node = null;

    private readonly util = new PaymentUtility();

    protected OnInit(data: WithdrawalDetailsData = null): void {
        if (data?.withdrawId != null && this.withdrawIdLabel) {
            this.withdrawIdLabel.string = String(data.withdrawId);
        }
        if (data?.amount != null && this.amountLabel) {
            this.amountLabel.string = this.util.formatMoney(data.amount);
        }
        if (this.statusLabel) {
            this.statusLabel.string = data?.status ?? "";
        }
        const lines = data?.process ?? [];
        const moban = this.timelineRoot?.getChildByName("line0");
        if (moban && lines.length) {
            lines.forEach((text, i) => {
                const row = i === 0 ? moban : moban.clone();
                if (i > 0) {
                    this.timelineRoot?.addChild(row);
                }
                row.getComponent(Label)?.string = text;
            });
        }
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("remind_btn", () => this.CloseSelf());
    }

    protected OnClose(): void {}
}

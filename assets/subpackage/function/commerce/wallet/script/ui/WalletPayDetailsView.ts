import { _decorator, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { FetchLedgerOneCommand } from "../../../../../script/game/commerce/command/FetchLedgerOneCommand";
import { LedgerDetailOpenData } from "../../../../../script/game/commerce/config/PaymentProtocol";
import { PaymentModel } from "../../../../../script/game/commerce/model/PaymentModel";
import { PaymentUtility } from "../../../../../script/game/commerce/utility/PaymentUtility";
import { setLabel } from "../utility/PurseNodeUtil";
import { PaymentDialogBase } from "./PaymentDialogBase";
import { ensurePurseRegistered } from "../PurseModule";

const { ccclass, property } = _decorator;

@ccclass("WalletPayDetailsView")
export class WalletPayDetailsView extends PaymentDialogBase {
    @property(Label)
    public amountLabel: Label = null;

    @property(Label)
    public statusLabel: Label = null;

    @property(Node)
    public timelineRoot: Node = null;

    private readonly util = new PaymentUtility();

    protected OnInit(uiData: LedgerDetailOpenData = null): void {
        ensurePurseRegistered();
        const id = uiData?.ledgerId ?? 0;
        if (id > 0) {
            GameApp.Interface.SendCommand(new FetchLedgerOneCommand(id));
        }
        GameApp.Interface.GetModel(PaymentModel).ledgerDetail.RegisterWithInitValue((d) => this.apply(d), this).UnRegisterWhenGameObjectDestroyed(this.node);
        this.wireByName("btn_close", () => this.CloseSelf());
    }

    protected OnClose(): void {}

    private apply(d: PaymentModel["ledgerDetail"]["value"]): void {
        if (this.amountLabel) {
            this.amountLabel.string = this.util.formatMoney(d.amount);
        }
        if (this.statusLabel) {
            this.statusLabel.string = d.status ?? "";
        }
        setLabel(this.node, "detail", d.detail ?? "");
        setLabel(this.node, "title", d.title ?? "");
        const lines = d.timeline ?? [];
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
    }
}

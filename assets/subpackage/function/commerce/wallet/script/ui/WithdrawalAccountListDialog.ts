import { _decorator, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { DeletePayoutAccountCommand } from "../../../../../script/game/commerce/command/DeletePayoutAccountCommand";
import { FetchWithdrawPageCommand } from "../../../../../script/game/commerce/command/FetchWithdrawPageCommand";
import { PaymentModel } from "../../../../../script/game/commerce/model/PaymentModel";
import { PaymentDialogBase } from "./PaymentDialogBase";
import { ensurePurseRegistered, openWithdrawalEdit } from "../PurseModule";

const { ccclass, property } = _decorator;

@ccclass("WithdrawalAccountListDialog")
export class WithdrawalAccountListDialog extends PaymentDialogBase {
    @property(Node)
    public listRoot: Node = null;

    protected OnInit(): void {
        ensurePurseRegistered();
        GameApp.Interface.SendCommand(new FetchWithdrawPageCommand());
        GameApp.Interface.GetModel(PaymentModel).withdrawPage.RegisterWithInitValue((p) => this.render(p.accounts ?? []), this).UnRegisterWhenGameObjectDestroyed(this.node);
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("add_bank", () => void openWithdrawalEdit());
    }

    protected OnClose(): void {}

    private render(accounts: PaymentModel["withdrawPage"]["value"]["accounts"]): void {
        const moban = this.listRoot?.getChildByName("item0");
        if (!moban) {
            return;
        }
        accounts.forEach((acc, i) => {
            const row = i === 0 ? moban : moban.clone();
            if (i > 0) {
                this.listRoot?.addChild(row);
            }
            const text = acc.upi_id || acc.account_no || "";
            row.getChildByName("label")?.getComponent(Label)?.string = text;
            row.getChildByName("default_mark")?.active = !!acc.is_default;
            row.getChildByName("edit_btn")?.on(Node.EventType.TOUCH_END, () => void openWithdrawalEdit(), this);
            row.getChildByName("delete_btn")?.on(Node.EventType.TOUCH_END, () => {
                if (acc.id) {
                    GameApp.Interface.SendCommand(new DeletePayoutAccountCommand(acc.id));
                }
            }, this);
        });
    }
}

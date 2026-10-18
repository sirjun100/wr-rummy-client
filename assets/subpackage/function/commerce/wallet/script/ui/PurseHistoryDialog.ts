import { _decorator, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { FetchLedgerListCommand } from "../../../../../script/game/commerce/command/FetchLedgerListCommand";
import { LedgerOpenData } from "../../../../../script/game/commerce/config/PaymentProtocol";
import { PaymentModel } from "../../../../../script/game/commerce/model/PaymentModel";
import { bindLedgerRows } from "../controller/LedgerListBinder";
import { PaymentDialogBase } from "./PaymentDialogBase";
import { ensurePurseRegistered, openWalletPayDetails } from "../PurseModule";

const { ccclass, property } = _decorator;

@ccclass("PurseHistoryDialog")
export class PurseHistoryDialog extends PaymentDialogBase {
    @property(Node)
    public recordScrollView: Node = null;

    private lastId = 0;

    protected OnInit(_uiData: LedgerOpenData = null): void {
        ensurePurseRegistered();
        this.lastId = 0;
        GameApp.Interface.SendCommand(new FetchLedgerListCommand());
        GameApp.Interface.GetModel(PaymentModel).ledgerList.RegisterWithInitValue((list) => this.renderList(list), this).UnRegisterWhenGameObjectDestroyed(this.node);
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("load_more_btn", () => {
            const list = GameApp.Interface.GetModel(PaymentModel).ledgerList.value;
            const tail = list[list.length - 1];
            if (tail?.id) {
                this.lastId = tail.id;
                GameApp.Interface.SendCommand(new FetchLedgerListCommand(this.lastId));
            }
        });
    }

    protected OnClose(): void {}

    private renderList(list: PaymentModel["ledgerList"]["value"]): void {
        if (!this.recordScrollView) {
            return;
        }
        bindLedgerRows(this.recordScrollView, "recordMoban", list, 20, (id) => void openWalletPayDetails(id), this);
    }
}

import { _decorator, EditBox, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { FetchWithdrawPageCommand } from "../../../../../script/game/commerce/command/FetchWithdrawPageCommand";
import { FetchWithdrawListCommand } from "../../../../../script/game/commerce/command/FetchWithdrawListCommand";
import { SubmitWithdrawCommand } from "../../../../../script/game/commerce/command/SubmitWithdrawCommand";
import { PaymentModel } from "../../../../../script/game/commerce/model/PaymentModel";
import { PurseI18n } from "../config/PurseConfig";
import { applyWithdrawPage, bindWithdrawRecords } from "../controller/WithdrawMainBinder";
import { PurseUiModel } from "../model/PurseUiModel";
import { PaymentDialogBase } from "./PaymentDialogBase";
import { ensurePurseRegistered, openWithdrawalEdit, openWithdrawalAccountList } from "../PurseModule";

const { ccclass, property } = _decorator;

@ccclass("WithdrawalMainDialog")
export class WithdrawalMainDialog extends PaymentDialogBase {
    @property(Label)
    public withdrawableLabel: Label = null;

    @property(Node)
    public depositNode: Node = null;

    @property(Node)
    public recordNode: Node = null;

    @property(Node)
    public recordScrollView: Node = null;

    @property(EditBox)
    public amountEdit: EditBox = null;

    protected OnInit(): void {
        ensurePurseRegistered();
        GameApp.Interface.SendCommand(new FetchWithdrawPageCommand());
        GameApp.Interface.SendCommand(new FetchWithdrawListCommand());
        const model = GameApp.Interface.GetModel(PaymentModel);
        const ui = GameApp.Interface.GetModel(PurseUiModel);
        model.withdrawPage.RegisterWithInitValue((p) => {
            applyWithdrawPage(this.node, p, this.withdrawableLabel);
            if (p.kyc_check !== 2) {
                GameApp.Interface.GetSystem(UISystem).showToast(PurseI18n.kycRequired);
            }
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
        model.withdrawList.RegisterWithInitValue((list) => {
            if (this.recordScrollView) {
                bindWithdrawRecords(this.recordScrollView, "recordMoban", list, this);
            }
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
        this.setTab(ui.withdrawTab.value);
        ui.withdrawTab.Register((tab) => this.setTab(tab), this).UnRegisterWhenGameObjectDestroyed(this.node);
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("add_account_btn", () => void openWithdrawalEdit());
        this.wireByName("account_list_btn", () => void openWithdrawalAccountList());
        this.wireByName("tab_deposit", () => {
            ui.withdrawTab.value = 0;
        });
        this.wireByName("tab_record", () => {
            ui.withdrawTab.value = 1;
        });
        this.wireByName("assure_btn", () => this.submitWithdraw());
    }

    protected OnClose(): void {}

    private setTab(tab: number): void {
        if (this.depositNode) {
            this.depositNode.active = tab === 0;
        }
        if (this.recordNode) {
            this.recordNode.active = tab === 1;
        }
    }

    private submitWithdraw(): void {
        const page = GameApp.Interface.GetModel(PaymentModel).withdrawPage.value;
        void import("../../kyc/script/utility/VerifyKycGate").then(async (g) => {
            if (g.needsKycForWithdraw(page)) {
                await g.promptKycIfNeeded(page.kyc_check, PurseI18n.kycRequired);
                return;
            }
            this.submitWithdrawAfterKyc(page);
        });
    }

    private submitWithdrawAfterKyc(page: import("../../../../../script/game/commerce/config/PaymentProtocol").WithdrawPageDto): void {
        if (page.kyc_check !== 2) {
            return;
        }
        const amount = Number(this.amountEdit?.string ?? "0");
        const accounts = page.accounts ?? [];
        const acc = accounts.find((a) => a.is_default) ?? accounts[0];
        if (!acc?.id || amount <= 0) {
            return;
        }
        void import("../../../shared/commonUi/script/PublicModule").then((m) => {
            m.showAlert({
                title: "Confirm",
                content: `Withdraw ${amount}?`,
                onOk: () => {
                    GameApp.Interface.SendCommand(new SubmitWithdrawCommand(amount, acc.id!));
                },
            });
        });
    }
}

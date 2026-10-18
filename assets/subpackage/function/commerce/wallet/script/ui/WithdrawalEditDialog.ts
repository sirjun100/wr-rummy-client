import { _decorator, EditBox } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { SavePayoutAccountCommand } from "../../../../../script/game/commerce/command/SavePayoutAccountCommand";
import { PurseWType } from "../config/PurseConfig";
import { PaymentDialogBase } from "./PaymentDialogBase";
import { ensurePurseRegistered } from "../PurseModule";

const { ccclass, property } = _decorator;

@ccclass("WithdrawalEditDialog")
export class WithdrawalEditDialog extends PaymentDialogBase {
    @property(EditBox)
    public accountEdit: EditBox = null;

    @property(EditBox)
    public upiEdit: EditBox = null;

    @property(EditBox)
    public bankNameEdit: EditBox = null;

    private wType = PurseWType.Upi;

    protected OnInit(): void {
        ensurePurseRegistered();
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("tab_upi", () => {
            this.wType = PurseWType.Upi;
        });
        this.wireByName("tab_bank", () => {
            this.wType = PurseWType.Bank;
        });
        this.wireByName("save_btn", () => this.onSaveAccount());
    }

    protected OnClose(): void {}

    private onSaveAccount(): void {
        const upi = this.upiEdit?.string?.trim() ?? "";
        const accountNo = this.accountEdit?.string?.trim() ?? "";
        const bankName = this.bankNameEdit?.string?.trim() ?? "Bank";
        if (this.wType === PurseWType.Upi && !upi) {
            GameApp.Interface.GetSystem(UISystem).showToast("Enter UPI ID");
            return;
        }
        if (this.wType === PurseWType.Bank && !accountNo) {
            GameApp.Interface.GetSystem(UISystem).showToast("Enter account number");
            return;
        }
        GameApp.Interface.SendCommand(
            new SavePayoutAccountCommand({
                w_type: this.wType,
                bank_name: bankName,
                account_no: accountNo,
                upi_id: upi,
                is_default: true,
            }),
        );
        this.CloseSelf();
    }
}

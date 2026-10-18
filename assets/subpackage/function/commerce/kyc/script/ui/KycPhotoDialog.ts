import { _decorator, Label } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { FetchKycPageCommand } from "../../../../../script/game/commerce/command/FetchKycPageCommand";
import { FetchPaymentProfileCommand } from "../../../../../script/game/commerce/command/FetchPaymentProfileCommand";
import { PaymentModel } from "../../../../../script/game/commerce/model/PaymentModel";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { RunKycSubmitCommand } from "../command/RunKycSubmitCommand";
import { kycStatusLabel, VerifyI18n } from "../config/VerifyConfig";
import { findDeep } from "../utility/PersonBindUiHelper";
import { isKycVerified } from "../utility/VerifyKycGate";
import { VerifyDialogBase } from "../utility/VerifyDialogBase";

const { ccclass } = _decorator;

@ccclass("KycPhoto")
export class KycPhotoDialog extends VerifyDialogBase {
    protected OnInit(): void {
        GameApp.Interface.SendCommand(new FetchKycPageCommand());
        GameApp.Interface.SendCommand(new FetchPaymentProfileCommand());
        const payment = GameApp.Interface.GetModel(PaymentModel);
        payment.kycPage.RegisterWithInitValue((p) => this.applyKycPage(p), this).UnRegisterWhenGameObjectDestroyed(this.node);
        this.wirePhotoMenu();
    }

    protected OnClose(): void {}

    private applyKycPage(page: { kyc_check?: number; kyc_list?: Record<string, string> }): void {
        const status = kycStatusLabel(page.kyc_check);
        for (const itemName of ["item1", "item2", "item3"]) {
            const wz = findDeep(this.node, itemName)?.getChildByName("wz");
            const lb = wz?.getComponent(Label);
            if (lb && itemName === "item1") {
                lb.string = status;
            }
        }
        if (isKycVerified(page.kyc_check)) {
            GameApp.Interface.GetSystem(UISystem).showToast(VerifyI18n.kycVerified);
        }
    }

    private wirePhotoMenu(): void {
        this.wireByName("item1", () => {
            GameApp.Interface.GetSystem(UISystem).showToast(VerifyI18n.documentUploadP2);
        });
        this.wireByName("item2", () => {
            const page = GameApp.Interface.GetModel(PaymentModel).kycPage.value;
            if (isKycVerified(page.kyc_check)) {
                return;
            }
            const profile = GameApp.Interface.GetModel(PaymentModel).profile.value;
            const name =
                (page.kyc_list?.card ?? "").trim() ||
                (profile.name ?? "").trim() ||
                (profile.tel_no ?? "").trim();
            GameApp.Interface.SendCommand(new RunKycSubmitCommand(name, () => this.CloseSelf()));
        });
        this.wireByName("item3", () => this.CloseSelf());
        this.wireByName("bg", () => this.CloseSelf());
    }
}

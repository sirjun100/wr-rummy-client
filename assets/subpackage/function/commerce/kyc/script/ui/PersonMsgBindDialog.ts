import { _decorator } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { FetchPaymentProfileCommand } from "../../../../../script/game/commerce/command/FetchPaymentProfileCommand";
import { RunPersonBindConfirmCommand } from "../command/RunPersonBindConfirmCommand";
import { RunPersonBindOtpCommand } from "../command/RunPersonBindOtpCommand";
import type { PersonBindOpenData } from "../config/VerifyProtocol";
import { VerifyModel } from "../model/VerifyModel";
import {
    applyBindTab,
    getOtpEdit,
    getValueEdit,
    setOtpCooldownUi,
} from "../utility/PersonBindUiHelper";
import { VerifyDialogBase } from "../utility/VerifyDialogBase";

const { ccclass } = _decorator;

@ccclass("PersonMsgBindDialog")
export class PersonMsgBindDialog extends VerifyDialogBase {
    private bindType: PersonBindOpenData = "tel";
    private cooldownTimer = 0;

    protected OnInit(bindType: PersonBindOpenData = "tel"): void {
        this.bindType = bindType;
        GameApp.Interface.GetModel(VerifyModel).activeBindType = bindType;
        GameApp.Interface.SendCommand(new FetchPaymentProfileCommand());
        applyBindTab(this.node, bindType);
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("verify_btn", () => this.sendOtp());
        this.wireByName("resend_btn", () => this.sendOtp());
        this.refreshCooldownUi();
        this.cooldownTimer = window.setInterval(() => this.refreshCooldownUi(), 500);
        this.wireByName("del_btn", () => {
            const edit = getValueEdit(this.node, this.bindType);
            if (edit) {
                edit.string = "";
            }
        });
        this.wireSubmitOnEnter(() => this.confirmBind());
    }

    protected OnClose(): void {
        if (this.cooldownTimer) {
            clearInterval(this.cooldownTimer);
            this.cooldownTimer = 0;
        }
    }

    private sendOtp(): void {
        GameApp.Interface.SendCommand(new RunPersonBindOtpCommand(this.bindType));
    }

    private confirmBind(): void {
        const value = getValueEdit(this.node, this.bindType)?.string ?? "";
        const otp = getOtpEdit(this.node, this.bindType)?.string ?? "";
        GameApp.Interface.SendCommand(
            new RunPersonBindConfirmCommand(this.bindType, value, otp, () => this.CloseSelf()),
        );
    }

    private wireSubmitOnEnter(_submit: () => void): void {
        const otpEdit = getOtpEdit(this.node, this.bindType);
        if (!otpEdit) {
            return;
        }
        otpEdit.node.on("editing-did-ended", () => {
            if ((otpEdit.string ?? "").length >= 4) {
                this.confirmBind();
            }
        });
    }

    private refreshCooldownUi(): void {
        const model = GameApp.Interface.GetModel(VerifyModel);
        setOtpCooldownUi(this.node, this.bindType, model.otpCooldownRemainingSec());
    }
}

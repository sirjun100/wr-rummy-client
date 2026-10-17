import { _decorator, Button, Component, EditBox, Label, ProgressBar } from "cc";
import { GameApp } from "../../GameApp";
import { DemoPassword } from "../../config/StartConfig";
import { StartProgressEvent } from "../../event/StartEvents";
import { FacebookLoginCommand } from "../../command/FacebookLoginCommand";
import { GoogleLoginCommand } from "../../command/GoogleLoginCommand";
import { AppleLoginCommand } from "../../command/AppleLoginCommand";
import { GuestLoginCommand } from "../../command/GuestLoginCommand";
import { LoginCommand } from "../../command/LoginCommand";
import { RequestOtpCommand } from "../../command/RequestOtpCommand";
import { SubmitOtpLoginCommand } from "../../command/SubmitOtpLoginCommand";

const { ccclass, property } = _decorator;

@ccclass("StartSceneView")
export class StartSceneView extends Component {
    @property(ProgressBar)
    public progressBar: ProgressBar = null;

    @property(Label)
    public progressLabel: Label = null;

    @property(EditBox)
    public accountField: EditBox = null;

    @property(EditBox)
    public passwordField: EditBox = null;

    @property(EditBox)
    public phoneField: EditBox = null;

    @property(EditBox)
    public otpField: EditBox = null;

    @property(Button)
    public loginBtn: Button = null;

    @property(Button)
    public guestBtn: Button = null;

    protected onLoad(): void {
        GameApp.Interface.RegisterEvent(StartProgressEvent, this.onProgress, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        if (this.passwordField) {
            this.passwordField.string = DemoPassword;
        }
    }

    private onProgress(e: StartProgressEvent): void {
        if (this.progressBar) {
            this.progressBar.progress = e.progress;
        }
        if (this.progressLabel) {
            this.progressLabel.string = `${Math.floor(e.progress * 100)}%`;
        }
    }

    public onClickPasswordLogin(): void {
        const account = this.accountField?.string ?? "";
        const password = this.passwordField?.string ?? DemoPassword;
        GameApp.Interface.SendCommand(new LoginCommand(account, password));
    }

    public onClickGuest(): void {
        GameApp.Interface.SendCommand(new GuestLoginCommand());
    }

    public onClickRequestOtp(): void {
        const phone = this.phoneField?.string ?? "";
        GameApp.Interface.SendCommand(new RequestOtpCommand(phone));
    }

    public onClickOtpLogin(): void {
        const phone = this.phoneField?.string ?? "";
        const code = this.otpField?.string ?? "";
        GameApp.Interface.SendCommand(new SubmitOtpLoginCommand(phone, code));
    }

    public onClickFacebook(): void {
        GameApp.Interface.SendCommand(new FacebookLoginCommand());
    }

    public onClickGoogle(): void {
        GameApp.Interface.SendCommand(new GoogleLoginCommand());
    }

    public onClickApple(): void {
        GameApp.Interface.SendCommand(new AppleLoginCommand());
    }

}

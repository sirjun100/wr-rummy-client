import { _decorator, Button } from "cc";
import { LoginCommand } from "../command/LoginCommand";
import { BaseController } from "./engine/BaseController";
import { LoginFailedEvent } from "../event/LoginFailedEvent";
import { LoginSuccessEvent } from "../event/LoginSuccessEvent";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";

const { ccclass, property } = _decorator;

@ccclass("LoginController")
export class LoginController extends BaseController {
    @property(Button)
    public btnLogin: Button = null;

    protected onLoad(): void {
        this.RegisterEvent(LoginSuccessEvent, this.onLoginSuccess, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        this.RegisterEvent(LoginFailedEvent, this.onLoginFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);

        this.btnLogin?.node.on(Button.EventType.CLICK, this.onClickLogin, this);
    }

    protected onDestroy(): void {
        this.btnLogin?.node.off(Button.EventType.CLICK, this.onClickLogin, this);
    }

    private onClickLogin(): void {
        this.SendCommand(new LoginCommand("demo", "123456"));
    }

    private onLoginSuccess(e: LoginSuccessEvent): void {
        LogKit.I("[LoginController] logged in uid={0} account={1}", e.uid, e.account);
        // TODO: UIKit.OpenPanel(...)
    }

    private onLoginFailed(e: LoginFailedEvent): void {
        LogKit.W("[LoginController] login failed account={0} msg={1}", e.account, e.message);
    }
}

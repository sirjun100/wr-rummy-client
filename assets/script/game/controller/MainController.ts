import { _decorator, Label } from "cc";
import { LoginCommand } from "../command/LoginCommand";
import { BaseController } from "./engine/BaseController";
import { LoginFailedEvent } from "../event/LoginFailedEvent";
import { LoginSuccessEvent } from "../event/LoginSuccessEvent";
import { SubGameId } from "../config/BundleManifest";
import { BundleSystem } from "../system/BundleSystem";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";

const { ccclass, property } = _decorator;

/** 启动自动登录演示账号（与服务端 demoPassword 一致） */
const AUTO_LOGIN_ACCOUNT = "demo";
const AUTO_LOGIN_PASSWORD = "123456";

/** true: 登录后进 Rummy 场景（联调 BundleSystem）；false: 进大厅 Lobby.scene */
const DEV_ENTER_RUMMY_AFTER_LOGIN = true;

@ccclass("MainController")
export class MainController extends BaseController {
    @property(Label)
    public txtHello: Label = null;

    protected onLoad(): void {
        this.RegisterEvent(LoginSuccessEvent, this.onLoginSuccess, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        this.RegisterEvent(LoginFailedEvent, this.onLoginFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);

        LogKit.I("[MainController] auto login account={0}", AUTO_LOGIN_ACCOUNT);
        this.SendCommand(new LoginCommand(AUTO_LOGIN_ACCOUNT, AUTO_LOGIN_PASSWORD));
    }

    private onLoginSuccess(e: LoginSuccessEvent): void {
        LogKit.I("[MainController] LoginSuccess uid={0} account={1}", e.uid, e.account);
        if (this.txtHello) {
            this.txtHello.string = `Hello,${e.account}`;
        }
        const bundle = this.GetSystem(BundleSystem);
        if (DEV_ENTER_RUMMY_AFTER_LOGIN) {
            bundle.enterGame(SubGameId.Rummy).catch((err) => {
                LogKit.E("[MainController] enterGame Rummy failed {0}", err instanceof Error ? err.message : String(err));
            });
        } else {
            bundle.goLobby().catch((err) => {
                LogKit.E("[MainController] goLobby failed {0}", err instanceof Error ? err.message : String(err));
            });
        }
    }

    private onLoginFailed(e: LoginFailedEvent): void {
        LogKit.W("[MainController] LoginFailed account={0} msg={1}", e.account, e.message);
        if (this.txtHello) {
            this.txtHello.string = `Login failed: ${e.message}`;
        }
    }
}

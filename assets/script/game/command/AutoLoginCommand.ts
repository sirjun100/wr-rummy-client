import { AbstractCommand } from "../../framework/QFramework";
import { LoginType } from "../config/StartConfig";
import { LocalStorageKeys } from "../utility/LocalStorageKeys";
import { FacebookLoginCommand } from "./FacebookLoginCommand";
import { GoogleLoginCommand } from "./GoogleLoginCommand";
import { AppleLoginCommand } from "./AppleLoginCommand";
import { GuestLoginCommand } from "./GuestLoginCommand";
import { LoginCommand } from "./LoginCommand";
import { SubmitOtpLoginCommand } from "./SubmitOtpLoginCommand";

export class AutoLoginCommand extends AbstractCommand {
    protected OnExecute(): void {
        const t = LocalStorageKeys.getLoginType();
        if (!t || t === "-1") {
            return;
        }
        switch (t) {
            case LoginType.Guest:
                this.SendCommand(new GuestLoginCommand());
                break;
            case LoginType.Facebook:
                this.SendCommand(new FacebookLoginCommand());
                break;
            case LoginType.Password: {
                const phone = LocalStorageKeys.getSavedPhone();
                if (phone) {
                    this.SendCommand(new LoginCommand(phone, "123456"));
                }
                break;
            }
            case LoginType.Otp: {
                const phone = LocalStorageKeys.getCodePhone();
                const pwd = LocalStorageKeys.getCodePwd();
                if (phone && pwd) {
                    this.SendCommand(new SubmitOtpLoginCommand(phone, pwd));
                }
                break;
            }
            case LoginType.Google:
                this.SendCommand(new GoogleLoginCommand());
                break;
            case LoginType.Apple:
                this.SendCommand(new AppleLoginCommand());
                break;
            default:
                break;
        }
    }
}

import { AbstractCommand } from "../../framework/QFramework";
import { LoginType } from "../config/StartConfig";
import { LocalStorageKeys } from "../utility/LocalStorageKeys";
import { NetworkSystem } from "../system/NetworkSystem";
import { PlatformSystem } from "../system/PlatformSystem";

export class FacebookLoginCommand extends AbstractCommand {
    protected OnExecute(): void {
        LocalStorageKeys.setLoginType(LoginType.Facebook);
        const token = this.GetSystem(PlatformSystem).getStubSocialToken("facebook");
        void this.GetSystem(NetworkSystem).loginFacebook(token);
    }
}

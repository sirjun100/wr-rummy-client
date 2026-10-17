import { AbstractCommand } from "../../framework/QFramework";
import { LoginType } from "../config/StartConfig";
import { LocalStorageKeys } from "../utility/LocalStorageKeys";
import { NetworkSystem } from "../system/NetworkSystem";
import { PlatformSystem } from "../system/PlatformSystem";

export class GoogleLoginCommand extends AbstractCommand {
    protected OnExecute(): void {
        LocalStorageKeys.setLoginType(LoginType.Google);
        const token = this.GetSystem(PlatformSystem).getStubSocialToken("google");
        void this.GetSystem(NetworkSystem).loginGoogle(token);
    }
}

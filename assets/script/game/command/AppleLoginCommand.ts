import { AbstractCommand } from "../../framework/QFramework";
import { LoginType } from "../config/StartConfig";
import { LocalStorageKeys } from "../utility/LocalStorageKeys";
import { NetworkSystem } from "../system/NetworkSystem";
import { PlatformSystem } from "../system/PlatformSystem";

export class AppleLoginCommand extends AbstractCommand {
    protected OnExecute(): void {
        LocalStorageKeys.setLoginType(LoginType.Apple);
        const token = this.GetSystem(PlatformSystem).getStubSocialToken("apple");
        void this.GetSystem(NetworkSystem).loginApple(token);
    }
}

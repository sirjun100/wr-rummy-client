import { AbstractCommand } from "../../framework/QFramework";
import { LoginType } from "../config/StartConfig";
import { LocalStorageKeys } from "../utility/LocalStorageKeys";
import { NetworkSystem } from "../system/NetworkSystem";
import { PlatformSystem } from "../system/PlatformSystem";

export class GuestLoginCommand extends AbstractCommand {
    protected OnExecute(): void {
        LocalStorageKeys.setLoginType(LoginType.Guest);
        const deviceId = this.GetSystem(PlatformSystem).getDeviceId();
        void this.GetSystem(NetworkSystem).loginGuest(deviceId);
    }
}

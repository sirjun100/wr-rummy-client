import { AbstractCommand } from "../../framework/QFramework";
import { LocalStorageKeys } from "../utility/LocalStorageKeys";
import { NetworkSystem } from "../system/NetworkSystem";

export class SubmitOtpLoginCommand extends AbstractCommand {
    public constructor(
        private readonly phone: string,
        private readonly code: string,
    ) {
        super();
    }

    protected OnExecute(): void {
        LocalStorageKeys.saveOtpSession(this.phone);
        void this.GetSystem(NetworkSystem).loginOtp(this.phone, this.code);
    }
}

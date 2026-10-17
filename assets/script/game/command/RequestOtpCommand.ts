import { AbstractCommand } from "../../framework/QFramework";
import { StartFlowModel } from "../model/StartFlowModel";
import { NetworkSystem } from "../system/NetworkSystem";

export class RequestOtpCommand extends AbstractCommand {
    public constructor(private readonly phone: string) {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .sendOtp(this.phone)
            .then((sec) => {
                const flow = this.GetModel(StartFlowModel);
                flow.pendingPhone = this.phone;
                flow.otpCountdownSec = sec;
            });
    }
}

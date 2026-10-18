import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";

export class SendProfileBindOtpCommand extends AbstractCommand {
    public constructor(private readonly bindType: "tel" | "email") {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<{ code?: number; otp?: string }>(PaymentRoute.ProfileBindSendOtp, {
                bind_type: this.bindType,
            })
            .catch((err) => {
                LogKit.W("[SendProfileBindOtpCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

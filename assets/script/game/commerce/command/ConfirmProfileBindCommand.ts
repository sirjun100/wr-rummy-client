import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";

export class ConfirmProfileBindCommand extends AbstractCommand {
    public constructor(
        private readonly bindType: "tel" | "email",
        private readonly value: string,
        private readonly code: string,
    ) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby(PaymentRoute.ProfileBindConfirm, {
                bind_type: this.bindType,
                value: this.value,
                code: this.code,
            })
            .catch((err) => {
                LogKit.W("[ConfirmProfileBindCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import { FetchWithdrawPageCommand } from "./FetchWithdrawPageCommand";

export class DeletePayoutAccountCommand extends AbstractCommand {
    public constructor(private readonly id: number) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby(PaymentRoute.PayoutAccountDelete, { id: this.id })
            .then(() => this.SendCommand(new FetchWithdrawPageCommand()))
            .catch((err) => {
                LogKit.W("[DeletePayoutAccountCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

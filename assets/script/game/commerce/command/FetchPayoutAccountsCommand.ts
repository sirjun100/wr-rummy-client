import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import { WithdrawPageRes } from "../config/PaymentProtocol";
import { FetchWithdrawPageCommand } from "./FetchWithdrawPageCommand";

export class FetchPayoutAccountsCommand extends AbstractCommand {
    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<{ code?: number; list?: WithdrawPageRes["data"] }>(PaymentRoute.PayoutAccountList, {})
            .then(() => this.SendCommand(new FetchWithdrawPageCommand()))
            .catch((err) => {
                LogKit.W("[FetchPayoutAccountsCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

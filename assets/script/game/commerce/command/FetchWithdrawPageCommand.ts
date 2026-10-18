import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import { WithdrawPageRes } from "../config/PaymentProtocol";
import { PaymentModel } from "../model/PaymentModel";

export class FetchWithdrawPageCommand extends AbstractCommand {
    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<WithdrawPageRes>(PaymentRoute.WithdrawPage, {})
            .then((res) => {
                if (res.data) {
                    this.GetModel(PaymentModel).withdrawPage.value = res.data;
                }
            })
            .catch((err) => {
                LogKit.W("[FetchWithdrawPageCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

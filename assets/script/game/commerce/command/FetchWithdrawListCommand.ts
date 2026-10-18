import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import type { WithdrawListRes } from "../config/PaymentProtocol";
import { PaymentModel } from "../model/PaymentModel";

export class FetchWithdrawListCommand extends AbstractCommand {
    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<WithdrawListRes>(PaymentRoute.WithdrawList, {})
            .then((res) => {
                this.GetModel(PaymentModel).withdrawList.value = res.list ?? [];
            })
            .catch((err) => {
                LogKit.W("[FetchWithdrawListCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

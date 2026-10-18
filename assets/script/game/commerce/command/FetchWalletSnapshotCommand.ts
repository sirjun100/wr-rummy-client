import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { WalletModel } from "../../model/WalletModel";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import { WalletSnapshotRes } from "../config/PaymentProtocol";

export class FetchWalletSnapshotCommand extends AbstractCommand {
    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<WalletSnapshotRes>(PaymentRoute.WalletSnapshot, {})
            .then((res) => {
                if (res.wallet) {
                    this.GetModel(WalletModel).apply(res.wallet);
                }
            })
            .catch((err) => {
                LogKit.W("[FetchWalletSnapshotCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

import { AbstractCommand } from "../../framework/QFramework";
import { PaymentRoute } from "../config/PaymentRoute";
import { WalletModel } from "../../model/WalletModel";
import { NetworkSystem } from "../../system/NetworkSystem";
import type { WalletSnapshotRes } from "../config/PaymentProtocol";

let registered = false;

export class RegisterPaymentPushCommand extends AbstractCommand {
    protected OnExecute(): void {
        if (registered) {
            return;
        }
        registered = true;
        const net = this.GetSystem(NetworkSystem);
        net.addLobbyPushListener(PaymentRoute.BalancePush, (payload) => {
            const data = payload as WalletSnapshotRes;
            if (data.wallet) {
                this.GetModel(WalletModel).apply(data.wallet);
            }
        });
    }
}

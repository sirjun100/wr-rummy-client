import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import { WithdrawSubmitRes } from "../config/PaymentProtocol";
import { WithdrawSubmittedEvent } from "../event/PaymentEvents";
import { FetchWalletSnapshotCommand } from "./FetchWalletSnapshotCommand";
import { FetchWithdrawPageCommand } from "./FetchWithdrawPageCommand";
import { FetchWithdrawListCommand } from "./FetchWithdrawListCommand";
import { UISystem } from "../../system/UISystem";
import { PaymentModel } from "../model/PaymentModel";

export class SubmitWithdrawCommand extends AbstractCommand {
    public constructor(
        private readonly amount: number,
        private readonly accountId: number,
    ) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<WithdrawSubmitRes>(PaymentRoute.WithdrawSubmit, {
                amount: this.amount,
                account_id: this.accountId,
            })
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    this.GetSystem(UISystem).showToast("Withdraw failed");
                    return;
                }
                if (res.data?.id) {
                    this.SendEvent(new WithdrawSubmittedEvent(res.data.id));
                    const model = this.GetModel(PaymentModel);
                    model.withdrawList.value = [res.data, ...model.withdrawList.value];
                }
                this.GetSystem(UISystem).showToast("Submitted");
                this.SendCommand(new FetchWalletSnapshotCommand());
                this.SendCommand(new FetchWithdrawPageCommand());
                this.SendCommand(new FetchWithdrawListCommand());
            })
            .catch((err) => {
                LogKit.W("[SubmitWithdrawCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

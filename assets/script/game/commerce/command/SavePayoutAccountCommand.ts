import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import { PayoutAccountDto } from "../config/PaymentProtocol";
import { FetchWithdrawPageCommand } from "./FetchWithdrawPageCommand";
import { UISystem } from "../../system/UISystem";

export class SavePayoutAccountCommand extends AbstractCommand {
    public constructor(private readonly account: PayoutAccountDto) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby(PaymentRoute.PayoutAccountSave, { account: this.account })
            .then(() => {
                this.GetSystem(UISystem).showToast("Saved");
                this.SendCommand(new FetchWithdrawPageCommand());
            })
            .catch((err) => {
                LogKit.W("[SavePayoutAccountCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

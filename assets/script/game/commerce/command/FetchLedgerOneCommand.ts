import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import { LedgerOneRes } from "../config/PaymentProtocol";
import { PaymentModel } from "../model/PaymentModel";

export class FetchLedgerOneCommand extends AbstractCommand {
    public constructor(private readonly id: number) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<LedgerOneRes>(PaymentRoute.LedgerOne, { id: this.id })
            .then((res) => {
                if (res.data) {
                    this.GetModel(PaymentModel).ledgerDetail.value = res.data;
                }
            })
            .catch((err) => {
                LogKit.W("[FetchLedgerOneCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

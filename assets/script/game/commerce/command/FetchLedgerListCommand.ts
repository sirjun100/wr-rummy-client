import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import { LedgerListRes } from "../config/PaymentProtocol";
import { PaymentModel } from "../model/PaymentModel";

export class FetchLedgerListCommand extends AbstractCommand {
    public constructor(private readonly lastId: number = 0) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<LedgerListRes>(PaymentRoute.LedgerList, { last_id: this.lastId, limit: 20 })
            .then((res) => {
                const list = res.data?.list ?? [];
                const model = this.GetModel(PaymentModel);
                if (this.lastId > 0) {
                    model.ledgerList.value = [...model.ledgerList.value, ...list];
                } else {
                    model.ledgerList.value = list;
                }
            })
            .catch((err) => {
                LogKit.W("[FetchLedgerListCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import { KycPageRes } from "../config/PaymentProtocol";
import { PaymentModel } from "../model/PaymentModel";

export class FetchKycPageCommand extends AbstractCommand {
    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<KycPageRes>(PaymentRoute.KycPage, {})
            .then((res) => {
                if (res.data) {
                    this.GetModel(PaymentModel).kycPage.value = res.data;
                }
            })
            .catch((err) => {
                LogKit.W("[FetchKycPageCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

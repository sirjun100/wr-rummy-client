import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import { MembershipPageRes } from "../config/PaymentProtocol";
import { PaymentModel } from "../model/PaymentModel";

export class FetchMembershipPageCommand extends AbstractCommand {
    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<MembershipPageRes>(PaymentRoute.MembershipPage, {})
            .then((res) => {
                if (res.data) {
                    this.GetModel(PaymentModel).membershipPage.value = res.data;
                }
            })
            .catch((err) => {
                LogKit.W("[FetchMembershipPageCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

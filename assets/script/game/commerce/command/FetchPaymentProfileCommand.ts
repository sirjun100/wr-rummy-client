import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import type { ProfileGetRes } from "../config/PaymentProtocol";
import { PaymentModel } from "../model/PaymentModel";

export class FetchPaymentProfileCommand extends AbstractCommand {
    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<ProfileGetRes>(PaymentRoute.ProfileGet, {})
            .then((res) => {
                if (res.profile) {
                    this.GetModel(PaymentModel).profile.value = res.profile;
                }
            })
            .catch((err) => {
                LogKit.W("[FetchPaymentProfileCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

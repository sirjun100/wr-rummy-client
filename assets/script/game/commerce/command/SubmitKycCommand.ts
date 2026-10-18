import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import { KycPageRes } from "../config/PaymentProtocol";
import { KycUpdatedEvent } from "../event/PaymentEvents";
import { PaymentModel } from "../model/PaymentModel";
import { FetchWalletSnapshotCommand } from "./FetchWalletSnapshotCommand";

export class SubmitKycCommand extends AbstractCommand {
    public constructor(private readonly name: string) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<KycPageRes>(PaymentRoute.KycSubmit, { name: this.name })
            .then((res) => {
                if (res.data) {
                    this.GetModel(PaymentModel).kycPage.value = res.data;
                }
                this.SendCommand(new FetchWalletSnapshotCommand());
                this.SendEvent(new KycUpdatedEvent());
            })
            .catch((err) => {
                LogKit.W("[SubmitKycCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

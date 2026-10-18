import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";

export class PatchProfileCommand extends AbstractCommand {
    public constructor(private readonly profile: Record<string, unknown>) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby(PaymentRoute.ProfilePatch, { profile: this.profile })
            .catch((err) => {
                LogKit.W("[PatchProfileCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

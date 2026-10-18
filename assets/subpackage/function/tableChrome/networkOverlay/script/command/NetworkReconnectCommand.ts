import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { NetworkDelayModel } from "../model/NetworkDelayModel";

export class NetworkReconnectCommand extends AbstractCommand {
    protected OnExecute(): void {
        const model = this.GetModel(NetworkDelayModel);
        void this.GetSystem(NetworkSystem)
            .reconnectGate()
            .then(() => {
                model.silentSec.value = 0;
                model.alertShown = false;
                model.activeDisconnect = false;
            })
            .catch((err) => {
                LogKit.W("[NetworkReconnectCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

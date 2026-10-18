import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";

export class SwitchGameGateCommand extends AbstractCommand {
    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .switchToNextGateUrl()
            .catch((err) => {
                LogKit.W("[SwitchGameGateCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

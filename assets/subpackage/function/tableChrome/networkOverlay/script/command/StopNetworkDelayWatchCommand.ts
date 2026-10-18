import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { NetworkDelaySystem } from "../system/NetworkDelaySystem";

export class StopNetworkDelayWatchCommand extends AbstractCommand {
    protected OnExecute(): void {
        this.GetSystem(NetworkDelaySystem).stopWatch();
    }
}

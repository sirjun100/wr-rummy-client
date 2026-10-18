import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { NetworkDelaySystem } from "../system/NetworkDelaySystem";

export class StartNetworkDelayWatchCommand extends AbstractCommand {
    protected OnExecute(): void {
        this.GetSystem(NetworkDelaySystem).startWatch();
    }
}

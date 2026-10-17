import { AbstractCommand } from "../../framework/QFramework";
import { StartupSteps } from "../config/StartConfig";
import { StartupSystem } from "../system/StartupSystem";
import { CheckHotUpdateCommand } from "./CheckHotUpdateCommand";

export class BootstrapStartupCommand extends AbstractCommand {
    protected OnExecute(): void {
        const startup = this.GetSystem(StartupSystem);
        startup.emitProgress(0, StartupSteps[0].start);
        void startup.fetchBootstrap().then(() => {
            this.SendCommand(new CheckHotUpdateCommand());
        });
    }
}

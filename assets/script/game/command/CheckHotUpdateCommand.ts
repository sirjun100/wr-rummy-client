import { AbstractCommand } from "../../framework/QFramework";
import { StartupSystem } from "../system/StartupSystem";
import { CompleteHotUpdateCommand } from "./CompleteHotUpdateCommand";

export class CheckHotUpdateCommand extends AbstractCommand {
    protected OnExecute(): void {
        void this.GetSystem(StartupSystem).checkHotUpdate().then(() => {
            this.SendCommand(new CompleteHotUpdateCommand());
        });
    }
}

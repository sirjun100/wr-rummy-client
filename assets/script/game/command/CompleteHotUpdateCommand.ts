import { AbstractCommand } from "../../framework/QFramework";
import { StartLoginFlowCommand } from "./StartLoginFlowCommand";

export class CompleteHotUpdateCommand extends AbstractCommand {
    protected OnExecute(): void {
        this.SendCommand(new StartLoginFlowCommand());
    }
}

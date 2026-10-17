import { AbstractCommand } from "../../framework/QFramework";
import { StartupSteps } from "../config/StartConfig";
import { AppBootstrapModel } from "../model/AppBootstrapModel";
import { StartFlowModel } from "../model/StartFlowModel";
import { StartupSystem } from "../system/StartupSystem";
import { AutoLoginCommand } from "./AutoLoginCommand";

export class StartLoginFlowCommand extends AbstractCommand {
    protected OnExecute(): void {
        const bootstrap = this.GetModel(AppBootstrapModel);
        const flow = this.GetModel(StartFlowModel);
        flow.loginPanelVisible = true;
        this.GetSystem(StartupSystem).emitProgress(3, StartupSteps[3].start);
        if (bootstrap.maintain?.msg) {
            // P0: maintain shown via log; UISystem generic dialog can be wired later.
        }
        this.SendCommand(new AutoLoginCommand());
    }
}

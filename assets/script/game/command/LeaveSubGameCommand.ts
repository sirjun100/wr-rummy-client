import { AbstractCommand } from "../../framework/QFramework";
import { BundleSystem } from "../system/BundleSystem";

export class LeaveSubGameCommand extends AbstractCommand {
    protected OnExecute(): void {
        this.GetSystem(BundleSystem).leaveGame().catch(() => {
            /* errors logged in BundleSystem */
        });
    }
}

import { AbstractCommand } from "../../framework/QFramework";
import { SubGameId } from "../config/BundleManifest";
import { BundleSystem } from "../system/BundleSystem";

export class EnterSubGameCommand extends AbstractCommand {
    public constructor(
        private readonly subGameId: SubGameId,
        private readonly sceneName: string | null = null,
    ) {
        super();
    }

    protected OnExecute(): void {
        const bundle = this.GetSystem(BundleSystem);
        bundle.enterGame(this.subGameId, this.sceneName).catch(() => {
            /* errors logged in BundleSystem */
        });
    }
}

export class LeaveSubGameCommand extends AbstractCommand {
    protected OnExecute(): void {
        this.GetSystem(BundleSystem).leaveGame().catch(() => {
            /* errors logged in BundleSystem */
        });
    }
}

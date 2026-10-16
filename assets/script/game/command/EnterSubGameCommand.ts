import { AbstractCommand } from "../../framework/QFramework";
import { SubGameId } from "../config/BundleManifest";
import { AudioSystem } from "../system/AudioSystem";
import { BundleSystem } from "../system/BundleSystem";

export class EnterSubGameCommand extends AbstractCommand {
    public constructor(
        private readonly subGameId: SubGameId,
        private readonly sceneName: string | null = null,
    ) {
        super();
    }

    protected OnExecute(): void {
        this.GetSystem(AudioSystem).preloadForSubGame(this.subGameId).catch(() => {
            /* logged in AudioSystem */
        });
        const bundle = this.GetSystem(BundleSystem);
        bundle.enterGame(this.subGameId, this.sceneName).catch(() => {
            /* errors logged in BundleSystem */
        });
    }
}

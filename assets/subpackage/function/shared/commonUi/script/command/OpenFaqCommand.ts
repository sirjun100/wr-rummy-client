import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { FetchFaqPageCommand } from "./FetchFaqPageCommand";
import { FaqNodeDialog } from "../ui/FaqNodeDialog";

export class OpenFaqCommand extends AbstractCommand {
    protected OnExecute(): void {
        this.SendCommand(new FetchFaqPageCommand());
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("commonUi");
        this.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        await this.GetSystem(UISystem).openDialogAsync(FaqNodeDialog, BundleKey.CommonUi, "FaqNode", {
            level: UILevel.PopUI,
        });
    }
}

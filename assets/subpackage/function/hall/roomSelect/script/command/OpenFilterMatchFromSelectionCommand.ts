import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";

export class OpenFilterMatchFromSelectionCommand extends AbstractCommand {
    protected OnExecute(): void {
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("lobby");
        this.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        const { FilterMatchDialog } = await import("../../lobby/script/ui/dialogs/FilterMatchDialog");
        await this.GetSystem(UISystem).openDialogAsync(FilterMatchDialog, BundleKey.Lobby, "FilterMatchDialog", {
            level: UILevel.PopUI,
        });
    }
}

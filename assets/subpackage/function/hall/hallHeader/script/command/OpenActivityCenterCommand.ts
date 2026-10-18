import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { LobbyTopViewPrefab } from "../config/LobbyTopViewConfig";
import { ActivityCenterDialog } from "../ui/ActivityCenterDialog";

export class OpenActivityCenterCommand extends AbstractCommand {
    protected OnExecute(): void {
        void import("../../lobby/script/LobbyModule").then((m) => {
            m.ensureLobbyRegistered();
            m.refreshFromHallHome();
        });
        const ui = this.GetSystem(UISystem);
        void ui.openDialogAsync(ActivityCenterDialog, BundleKey.HallHeader, LobbyTopViewPrefab.ActivityCenter, {
            level: UILevel.PopUI,
        });
    }
}

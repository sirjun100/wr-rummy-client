import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { LobbyTopViewPrefab } from "../config/LobbyTopViewConfig";
import type { OpenAnnouncementData } from "../config/LobbyTopViewProtocol";
import { UpdateGuideDialog } from "../ui/UpdateGuideDialog";

export class OpenUpdateGuideCommand extends AbstractCommand {
    constructor(private readonly data: OpenAnnouncementData) {
        super();
    }

    protected OnExecute(): void {
        const ui = this.GetSystem(UISystem);
        void ui.openDialogAsync(UpdateGuideDialog, BundleKey.HallHeader, LobbyTopViewPrefab.UpdateGuide, {
            level: UILevel.PopUI,
            uiData: this.data,
        });
    }
}

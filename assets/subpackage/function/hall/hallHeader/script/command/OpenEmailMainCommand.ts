import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { LobbyTopViewPrefab } from "../config/LobbyTopViewConfig";
import { FetchInboxListCommand } from "./FetchInboxListCommand";
import { EmailMainDialog } from "../ui/EmailMainDialog";

export class OpenEmailMainCommand extends AbstractCommand {
    protected OnExecute(): void {
        this.SendCommand(new FetchInboxListCommand("", false));
        const ui = this.GetSystem(UISystem);
        void ui.openDialogAsync(EmailMainDialog, BundleKey.HallHeader, LobbyTopViewPrefab.EmailMain, {
            level: UILevel.PopUI,
        });
    }
}

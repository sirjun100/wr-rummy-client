import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { FetchPropsPageCommand } from "./FetchPropsPageCommand";
import { PropsManageDialog } from "../ui/PropsManageDialog";

export class OpenPropsManageDialogCommand extends AbstractCommand {
    protected OnExecute(): void {
        this.SendCommand(new FetchPropsPageCommand());
        const ui = this.GetSystem(UISystem);
        void ui.openDialogAsync(PropsManageDialog, BundleKey.TableProps, "PropsManageDialog", {
            level: UILevel.PopUI,
        });
    }
}

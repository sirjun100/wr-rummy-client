import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { ClearTableRedDotCommand } from "./ClearTableRedDotCommand";
import { FetchPropsPageCommand } from "./FetchPropsPageCommand";
import { PropsManageRoomDialog } from "../ui/PropsManageRoomDialog";

export class OpenPropsRoomDialogCommand extends AbstractCommand {
    protected OnExecute(): void {
        this.SendCommand(new FetchPropsPageCommand());
        this.SendCommand(new ClearTableRedDotCommand());
        const ui = this.GetSystem(UISystem);
        void ui.openDialogAsync(PropsManageRoomDialog, BundleKey.TableProps, "PropsManageRoomDialog", {
            level: UILevel.PopUI,
        });
    }
}

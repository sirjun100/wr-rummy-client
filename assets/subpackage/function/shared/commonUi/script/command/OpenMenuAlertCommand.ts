import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import type { CommonAlertUiData } from "../config/PublicProtocol";
import { MenuAlertDialog } from "../ui/MenuAlertDialog";

export class OpenMenuAlertCommand extends AbstractCommand {
    public constructor(private readonly uiData: CommonAlertUiData) {
        super();
    }

    protected OnExecute(): void {
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("commonUi");
        await this.GetSystem(UISystem).openDialogAsync(MenuAlertDialog, BundleKey.CommonUi, "MenuAlertDialog", {
            uiData: this.uiData,
            level: UILevel.PopUI,
        });
    }
}

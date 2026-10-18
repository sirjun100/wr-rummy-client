import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import type { HelpAlertUiData } from "../config/PublicProtocol";
import { HelpAlertDialog } from "../ui/HelpAlertDialog";

export class OpenHelpAlertCommand extends AbstractCommand {
    public constructor(private readonly uiData: HelpAlertUiData) {
        super();
    }

    protected OnExecute(): void {
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("commonUi");
        await this.GetSystem(UISystem).openDialogAsync(HelpAlertDialog, BundleKey.CommonUi, "HelpAlertDialog", {
            uiData: this.uiData,
            level: UILevel.PopUI,
        });
    }
}

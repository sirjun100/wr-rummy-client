import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import type { CommonAlertUiData } from "../config/PublicProtocol";
import { CommonDialogDialog } from "../ui/CommonDialogDialog";

export class OpenCommonDialogCommand extends AbstractCommand {
    public constructor(private readonly uiData: CommonAlertUiData) {
        super();
    }

    protected OnExecute(): void {
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("commonUi");
        await this.GetSystem(UISystem).openDialogAsync(CommonDialogDialog, BundleKey.CommonUi, "CommonDialogDialog", {
            uiData: this.uiData,
            level: UILevel.PopUI,
        });
    }
}

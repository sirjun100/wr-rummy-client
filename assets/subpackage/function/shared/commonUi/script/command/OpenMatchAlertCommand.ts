import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import type { MatchAlertUiData } from "../config/PublicProtocol";
import { MatchAlertDialog } from "../ui/MatchAlertDialog";

export class OpenMatchAlertCommand extends AbstractCommand {
    public constructor(private readonly uiData: MatchAlertUiData) {
        super();
    }

    protected OnExecute(): void {
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("commonUi");
        await this.GetSystem(UISystem).openDialogAsync(MatchAlertDialog, BundleKey.CommonUi, "MatchAlertDialog", {
            uiData: this.uiData,
            level: UILevel.PopUI,
        });
    }
}

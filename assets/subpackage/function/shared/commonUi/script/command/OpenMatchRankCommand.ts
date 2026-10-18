import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import type { MatchRankUiData } from "../config/PublicProtocol";
import { MatchRankDialog } from "../ui/MatchRankDialog";

export class OpenMatchRankCommand extends AbstractCommand {
    public constructor(private readonly uiData: MatchRankUiData) {
        super();
    }

    protected OnExecute(): void {
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("commonUi");
        await this.GetSystem(UISystem).openDialogAsync(MatchRankDialog, BundleKey.CommonUi, "MatchRankDialog", {
            uiData: this.uiData,
            level: UILevel.PopUI,
        });
    }
}

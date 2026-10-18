import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import type { MatchPrizesRankUiData } from "../config/PublicProtocol";
import { MatchPrizesRankDialog } from "../ui/MatchPrizesRankDialog";

export class OpenMatchPrizesRankCommand extends AbstractCommand {
    public constructor(private readonly uiData: MatchPrizesRankUiData) {
        super();
    }

    protected OnExecute(): void {
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("commonUi");
        await this.GetSystem(UISystem).openDialogAsync(
            MatchPrizesRankDialog,
            BundleKey.CommonUi,
            "MatchPrizesRankDialog",
            {
                uiData: this.uiData,
                level: UILevel.PopUI,
            },
        );
    }
}

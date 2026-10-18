import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import type { RewardTipsUiData } from "../config/PublicProtocol";
import { RewardTipsDialog } from "../ui/RewardTipsDialog";

export class ShowRewardTipsCommand extends AbstractCommand {
    public constructor(private readonly uiData: RewardTipsUiData) {
        super();
    }

    protected OnExecute(): void {
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("commonUi");
        await this.GetSystem(UISystem).openDialogAsync(RewardTipsDialog, BundleKey.CommonUi, "RewardTipsDialog", {
            uiData: this.uiData,
            level: UILevel.PopUI,
        });
    }
}

import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { FetchHallRankDetailCommand } from "./FetchHallRankDetailCommand";
import { FetchHallRankMainCommand } from "./FetchHallRankMainCommand";
import { RankingsDialog } from "../ui/RankingsDialog";
import { ensureRankingsRegistered } from "../RankingsModule";

export class OpenRankingsDialogCommand extends AbstractCommand {
    protected OnExecute(): void {
        ensureRankingsRegistered();
        this.SendCommand(new FetchHallRankMainCommand());
        this.SendCommand(new FetchHallRankDetailCommand(true));
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("rankings");
        this.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        await this.GetSystem(UISystem).openDialogAsync(RankingsDialog, BundleKey.HallLeaderboard, "RankingsDialog", {
            level: UILevel.PopUI,
        });
    }
}

import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import type { RankingsPopActData } from "../config/RankingsProtocol";
import { RankingsPopActDialog } from "../ui/RankingsPopActDialog";
import { ensureRankingsRegistered } from "../RankingsModule";

export class OpenRankingsPopActCommand extends AbstractCommand {
    public constructor(private readonly uiData: RankingsPopActData) {
        super();
    }

    protected OnExecute(): void {
        ensureRankingsRegistered();
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("rankings");
        this.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        await this.GetSystem(UISystem).openDialogAsync(RankingsPopActDialog, BundleKey.HallLeaderboard, "RankingsPopActDialog", {
            level: UILevel.PopUI,
            uiData: this.uiData,
        });
    }
}

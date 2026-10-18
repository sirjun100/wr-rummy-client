import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import type { RankingsOptinData } from "../config/RankingsProtocol";
import { RankingsOptinDialog } from "../ui/RankingsOptinDialog";
import { ensureRankingsRegistered } from "../RankingsModule";

export class OpenRankingsOptinDialogCommand extends AbstractCommand {
    public constructor(
        private readonly uiData: RankingsOptinData,
        private readonly onStatus?: (status: number) => void,
    ) {
        super();
    }

    protected OnExecute(): void {
        ensureRankingsRegistered();
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("rankings");
        this.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        await this.GetSystem(UISystem).openDialogAsync(RankingsOptinDialog, BundleKey.HallLeaderboard, "RankingsOptin", {
            level: UILevel.PopUI,
            uiData: { ...this.uiData, onStatus: this.onStatus },
        });
    }
}

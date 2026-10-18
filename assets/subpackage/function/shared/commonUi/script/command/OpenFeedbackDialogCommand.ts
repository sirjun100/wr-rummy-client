import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import type { FeedbackSubmitReq } from "../config/PublicProtocol";
import { FeedbackDialog } from "../ui/FeedbackDialog";

export class OpenFeedbackDialogCommand extends AbstractCommand {
    public constructor(private readonly defaults: Partial<FeedbackSubmitReq> = {}) {
        super();
    }

    protected OnExecute(): void {
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("commonUi");
        this.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        await this.GetSystem(UISystem).openDialogAsync(FeedbackDialog, BundleKey.CommonUi, "FeedbackDialog", {
            uiData: this.defaults,
            level: UILevel.PopUI,
        });
    }
}

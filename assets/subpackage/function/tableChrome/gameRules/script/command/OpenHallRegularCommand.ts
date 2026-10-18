import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import type { HallRegularOpenData } from "../config/RegularProtocol";
import { RegularUiModel } from "../model/RegularUiModel";
import { RegularNodeDialog } from "../ui/RegularNodeDialog";
import { ensureRegularRegistered } from "../RegularModule";

export class OpenHallRegularCommand extends AbstractCommand {
    public constructor(private readonly data: HallRegularOpenData = {}) {
        super();
    }

    protected OnExecute(): void {
        ensureRegularRegistered();
        this.GetModel(RegularUiModel).hallOpen.value = { ...this.data };
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("regular");
        this.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        await this.GetSystem(UISystem).openDialogAsync(RegularNodeDialog, BundleKey.GameRules, "regular_node", {
            uiData: this.data,
            level: UILevel.PopUI,
            playClickSfx: true,
        });
    }
}

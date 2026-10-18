import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import type { GameSettingUiData } from "../config/PublicProtocol";
import { GameSettingDialog } from "../ui/GameSettingDialog";

export class OpenGameSettingCommand extends AbstractCommand {
    public constructor(private readonly uiData: GameSettingUiData = {}) {
        super();
    }

    protected OnExecute(): void {
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("commonUi");
        this.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        await this.GetSystem(UISystem).openDialogAsync(GameSettingDialog, BundleKey.CommonUi, "GameSettingDialog", {
            uiData: this.uiData,
            level: UILevel.PopUI,
        });
    }
}

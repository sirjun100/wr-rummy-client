import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey, SubGameId } from "../../../../../script/game/config/BundleManifest";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AppBootstrapModel } from "../../../../../script/game/model/AppBootstrapModel";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { resolveGameHelpKey } from "../config/RegularConfig";
import type { GameRegularOpenData } from "../config/RegularProtocol";
import { loadSpriteFromUrl } from "../utility/RegularUiHelper";
import { GameRegularDialog } from "../ui/GameRegularDialog";
import { ensureRegularRegistered } from "../RegularModule";

export class OpenGameRegularCommand extends AbstractCommand {
    public constructor(private readonly data: GameRegularOpenData) {
        super();
    }

    protected OnExecute(): void {
        ensureRegularRegistered();
        void this.open();
    }

    private async open(): Promise<void> {
        const payload = await this.resolvePayload();
        await this.GetSystem(BundleSystem).loadBundle("regular");
        this.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        await this.GetSystem(UISystem).openDialogAsync(GameRegularDialog, BundleKey.GameRules, "game_regular_node", {
            uiData: payload,
            level: UILevel.PopUI,
            playClickSfx: true,
        });
    }

    private async resolvePayload(): Promise<GameRegularOpenData> {
        const base = { ...this.data };
        if (base.text || base.spriteFrame || base.helpImageUrl) {
            return base;
        }
        const gameType = base.gameType ?? SubGameId.None;
        const key = resolveGameHelpKey(gameType);
        if (!key) {
            return base;
        }
        const entry = this.GetModel(AppBootstrapModel).gameHelp[key];
        if (!entry) {
            return base;
        }
        if (entry.help_text) {
            return { ...base, useText: true, text: entry.help_text };
        }
        if (entry.help_image_url) {
            const frame = await loadSpriteFromUrl(entry.help_image_url);
            return { ...base, spriteFrame: frame, useText: false };
        }
        return base;
    }
}

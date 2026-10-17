import { GameApp } from "../../../../script/game/GameApp";
import { AudioFxId } from "../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../script/game/config/BundleManifest";
import { AudioSystem } from "../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../script/game/system/UISystem";
import { UILevel } from "../../../../script/framework/toolkits/uiKit/UIKit";
import { AdvancedGiftOpenData } from "./config/AdvancedGiftTypes";
import { AdvancedGiftModel } from "./model/AdvancedGiftModel";
import { AdvancedGiftDialog } from "./ui/AdvancedGiftDialog";

let registered = false;

export function ensureAdvancedGiftRegistered(): void {
    if (registered) {
        return;
    }
    GameApp.Interface.RegisterModel(new AdvancedGiftModel());
    registered = true;
}

export async function openAdvancedGiftDialog(uiData?: AdvancedGiftOpenData): Promise<void> {
    ensureAdvancedGiftRegistered();
    const audio = GameApp.Interface.GetSystem(AudioSystem);
    audio.playFx(AudioFxId.ActPopShow);
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(
        AdvancedGiftDialog,
        BundleKey.AdvancedGift,
        "AdvancedGiftDialog",
        { uiData: uiData ?? new AdvancedGiftOpenData(), level: UILevel.PopUI },
    );
}

if (typeof globalThis !== "undefined") {
    (globalThis as { wrAdvancedGift?: { open: typeof openAdvancedGiftDialog } }).wrAdvancedGift = {
        open: openAdvancedGiftDialog,
    };
}

import { GameApp } from "../../../../script/game/GameApp";
import { AudioFxId } from "../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../script/game/config/BundleManifest";
import { AudioSystem } from "../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../script/game/system/UISystem";
import { UILevel } from "../../../../script/framework/toolkits/uiKit/UIKit";
import { DailyWorkOpenData } from "./config/DailyWorkConfig";
import { DailyWorkModel } from "./model/DailyWorkModel";
import { WelcomeBackWorkDialog } from "./ui/WelcomeBackWorkDialog";

let registered = false;

export function ensureDailyWorkRegistered(): void {
    if (registered) {
        return;
    }
    GameApp.Interface.RegisterModel(new DailyWorkModel());
    registered = true;
}

export async function openWelcomeBackWorkDialog(uiData?: DailyWorkOpenData): Promise<void> {
    ensureDailyWorkRegistered();
    const audio = GameApp.Interface.GetSystem(AudioSystem);
    audio.playFx(AudioFxId.ActPopShow);
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(
        WelcomeBackWorkDialog,
        BundleKey.DailyWork,
        "WelcomeBackWorkDialog",
        { uiData: uiData ?? new DailyWorkOpenData(), level: UILevel.PopUI },
    );
}

if (typeof globalThis !== "undefined") {
    (globalThis as { wrDailyWork?: { open: typeof openWelcomeBackWorkDialog } }).wrDailyWork = {
        open: openWelcomeBackWorkDialog,
    };
}

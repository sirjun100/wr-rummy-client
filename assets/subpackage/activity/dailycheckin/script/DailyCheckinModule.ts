import { GameApp } from "../../../../script/game/GameApp";
import { AudioFxId } from "../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../script/game/config/BundleManifest";
import { AudioSystem } from "../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../script/game/system/UISystem";
import { UILevel } from "../../../../script/framework/toolkits/uiKit/UIKit";
import { DailyCheckinOpenData } from "./config/DailyCheckinConfig";
import { DailyCheckinModel } from "./model/DailyCheckinModel";
import { DailyCheckinDialog } from "./ui/DailyCheckinDialog";

let registered = false;

export function ensureDailyCheckinRegistered(): void {
    if (registered) {
        return;
    }
    GameApp.Interface.RegisterModel(new DailyCheckinModel());
    registered = true;
}

export async function openDailyCheckinDialog(uiData?: DailyCheckinOpenData): Promise<void> {
    ensureDailyCheckinRegistered();
    const audio = GameApp.Interface.GetSystem(AudioSystem);
    audio.playFx(AudioFxId.ActPopShow);
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(
        DailyCheckinDialog,
        BundleKey.DailyCheckin,
        "DailyCheckinDialog",
        { uiData: uiData ?? new DailyCheckinOpenData(), level: UILevel.PopUI },
    );
}

if (typeof globalThis !== "undefined") {
    (globalThis as { wrDailyCheckin?: { open: typeof openDailyCheckinDialog } }).wrDailyCheckin = {
        open: openDailyCheckinDialog,
    };
}

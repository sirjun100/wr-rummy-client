import { GameApp } from "../../../../script/game/GameApp";
import { AudioFxId } from "../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../script/game/config/BundleManifest";
import { AudioSystem } from "../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../script/game/system/UISystem";
import { UILevel } from "../../../../script/framework/toolkits/uiKit/UIKit";
import { WeeklyMonthCardOpenData } from "./config/WeeklyMonthCardConfig";
import { WeeklyMonthCardModel } from "./model/WeeklyMonthCardModel";
import { WeeklyMonthCardUtility } from "./utility/WeeklyMonthCardUtility";
import { WeeklyMonthCardNewDialog } from "./ui/WeeklyMonthCardNewDialog";

let registered = false;

export function ensureWeeklyMonthCardRegistered(): void {
    if (registered) {
        return;
    }
    GameApp.Interface.RegisterModel(new WeeklyMonthCardModel());
    GameApp.Interface.RegisterUtility(new WeeklyMonthCardUtility());
    registered = true;
}

export async function openWeeklyMonthCardDialog(uiData?: WeeklyMonthCardOpenData): Promise<void> {
    ensureWeeklyMonthCardRegistered();
    const audio = GameApp.Interface.GetSystem(AudioSystem);
    audio.playFx(AudioFxId.ActPopShow);
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(
        WeeklyMonthCardNewDialog,
        BundleKey.WeeklyMonthCard,
        "WeeklyMonthCardNewDialog",
        { uiData: uiData ?? new WeeklyMonthCardOpenData(), level: UILevel.PopUI },
    );
}

if (typeof globalThis !== "undefined") {
    (globalThis as { wrWeeklyMonthCard?: { open: typeof openWeeklyMonthCardDialog } }).wrWeeklyMonthCard = {
        open: openWeeklyMonthCardDialog,
    };
}

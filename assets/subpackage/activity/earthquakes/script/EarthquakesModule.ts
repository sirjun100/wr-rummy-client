import { GameApp } from "../../../../script/game/GameApp";
import { AudioFxId } from "../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../script/game/config/BundleManifest";
import { AudioSystem } from "../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../script/game/system/UISystem";
import { UILevel } from "../../../../script/framework/toolkits/uiKit/UIKit";
import { EarthquakesOpenData } from "./config/EarthquakesConfig";
import { EarthquakesModel } from "./model/EarthquakesModel";
import { EarthquakesUtility } from "./utility/EarthquakesUtility";
import { EarthquakesDialog } from "./ui/EarthquakesDialog";
import { EarthquakesGameDialog } from "./ui/EarthquakesGameDialog";

let registered = false;

export function ensureEarthquakesRegistered(): void {
    if (registered) {
        return;
    }
    GameApp.Interface.RegisterModel(new EarthquakesModel());
    GameApp.Interface.RegisterUtility(new EarthquakesUtility());
    registered = true;
}

export async function openEarthquakesDialog(uiData?: EarthquakesOpenData): Promise<void> {
    ensureEarthquakesRegistered();
    const audio = GameApp.Interface.GetSystem(AudioSystem);
    audio.playFx(AudioFxId.ActPopShow);
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(
        EarthquakesDialog,
        BundleKey.Earthquakes,
        "EarthquakesDialog",
        { uiData: uiData ?? new EarthquakesOpenData(), level: UILevel.PopUI },
    );
}

export async function openEarthquakesGameDialog(uiData?: EarthquakesOpenData): Promise<void> {
    ensureEarthquakesRegistered();
    const audio = GameApp.Interface.GetSystem(AudioSystem);
    audio.playFx(AudioFxId.ActPopShow);
    const ui = GameApp.Interface.GetSystem(UISystem);
    const data = uiData ?? new EarthquakesOpenData(1, 0, 0, true);
    await ui.openDialogAsync(
        EarthquakesGameDialog,
        BundleKey.Earthquakes,
        "EarthquakesGameDialog",
        { uiData: data, level: UILevel.PopUI },
    );
}

if (typeof globalThis !== "undefined") {
    (globalThis as { wrEarthquakes?: { openHall: typeof openEarthquakesDialog; openGame: typeof openEarthquakesGameDialog } }).wrEarthquakes = {
        openHall: openEarthquakesDialog,
        openGame: openEarthquakesGameDialog,
    };
}

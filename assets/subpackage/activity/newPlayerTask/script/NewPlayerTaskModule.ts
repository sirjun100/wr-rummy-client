import { GameApp } from "../../../../script/game/GameApp";
import { AudioFxId } from "../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../script/game/config/BundleManifest";
import { AudioSystem } from "../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../script/game/system/UISystem";
import { UILevel } from "../../../../script/framework/toolkits/uiKit/UIKit";
import { NewPlayerTaskOpenData } from "./config/NewPlayerTaskConfig";
import { NewPlayerTaskModel } from "./model/NewPlayerTaskModel";
import { NewPlayerTaskUtility } from "./utility/NewPlayerTaskUtility";
import { NewPlayerTaskDialog } from "./ui/NewPlayerTaskDialog";

let registered = false;

export function ensureNewPlayerTaskRegistered(): void {
    if (registered) {
        return;
    }
    GameApp.Interface.RegisterModel(new NewPlayerTaskModel());
    GameApp.Interface.RegisterUtility(new NewPlayerTaskUtility());
    registered = true;
}

export async function openNewPlayerTaskDialog(uiData?: NewPlayerTaskOpenData): Promise<void> {
    ensureNewPlayerTaskRegistered();
    const audio = GameApp.Interface.GetSystem(AudioSystem);
    audio.playFx(AudioFxId.ActPopShow);
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(
        NewPlayerTaskDialog,
        BundleKey.NewPlayerTask,
        "NewPlayerTaskDialog",
        { uiData: uiData ?? new NewPlayerTaskOpenData(), level: UILevel.PopUI },
    );
}

if (typeof globalThis !== "undefined") {
    (globalThis as { wrNewPlayerTask?: { open: typeof openNewPlayerTaskDialog } }).wrNewPlayerTask = {
        open: openNewPlayerTaskDialog,
    };
}

import { GameApp } from "../../../../script/game/GameApp";
import { AudioFxId } from "../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../script/game/config/BundleManifest";
import { AudioSystem } from "../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../script/game/system/UISystem";
import { UILevel } from "../../../../script/framework/toolkits/uiKit/UIKit";
import { PiggyBankOpenData } from "./config/PiggyBankConfig";
import { PiggyBankModel } from "./model/PiggyBankModel";
import { PiggyBankUtility } from "./utility/PiggyBankUtility";
import { PiggyBankDialog } from "./ui/PiggyBankDialog";

let registered = false;

export function ensurePiggyBankRegistered(): void {
    if (registered) {
        return;
    }
    GameApp.Interface.RegisterModel(new PiggyBankModel());
    GameApp.Interface.RegisterUtility(new PiggyBankUtility());
    registered = true;
}

export async function openPiggyBankDialog(uiData?: PiggyBankOpenData): Promise<void> {
    ensurePiggyBankRegistered();
    const audio = GameApp.Interface.GetSystem(AudioSystem);
    audio.playFx(AudioFxId.ActPopShow);
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(
        PiggyBankDialog,
        BundleKey.PiggyBank,
        "PiggyBankDialog",
        { uiData: uiData ?? new PiggyBankOpenData(), level: UILevel.PopUI },
    );
}

if (typeof globalThis !== "undefined") {
    (globalThis as { wrPiggyBank?: { open: typeof openPiggyBankDialog } }).wrPiggyBank = {
        open: openPiggyBankDialog,
    };
}

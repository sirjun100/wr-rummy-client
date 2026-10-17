import { GameApp } from "../../../../script/game/GameApp";
import { AudioFxId } from "../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../script/game/config/BundleManifest";
import { AudioSystem } from "../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../script/game/system/UISystem";
import { UILevel } from "../../../../script/framework/toolkits/uiKit/UIKit";
import { PayOneForThreeOpenData } from "./config/PayOneForThreeConfig";
import { PayOneForThreeModel } from "./model/PayOneForThreeModel";
import { PayOneForThreeUtility } from "./utility/PayOneForThreeUtility";
import { PayOneForThreeDialog } from "./ui/PayOneForThreeDialog";

let registered = false;

export function ensurePayOneForThreeRegistered(): void {
    if (registered) {
        return;
    }
    GameApp.Interface.RegisterModel(new PayOneForThreeModel());
    GameApp.Interface.RegisterUtility(new PayOneForThreeUtility());
    registered = true;
}

export async function openPayOneForThreeDialog(uiData?: PayOneForThreeOpenData): Promise<void> {
    ensurePayOneForThreeRegistered();
    const audio = GameApp.Interface.GetSystem(AudioSystem);
    audio.playFx(AudioFxId.ActPopShow);
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(
        PayOneForThreeDialog,
        BundleKey.PayOneForThree,
        "PayOneForThreeDialog",
        { uiData: uiData ?? new PayOneForThreeOpenData(), level: UILevel.PopUI },
    );
}

export async function openPayOneForThreeGameDialog(uiData?: PayOneForThreeOpenData): Promise<void> {
    ensurePayOneForThreeRegistered();
    const audio = GameApp.Interface.GetSystem(AudioSystem);
    audio.playFx(AudioFxId.ActPopShow);
    const ui = GameApp.Interface.GetSystem(UISystem);
    const data = uiData ?? new PayOneForThreeOpenData(0, true);
    await ui.openDialogAsync(
        PayOneForThreeDialog,
        BundleKey.PayOneForThree,
        "PayOneForThreeGameDialog",
        { uiData: data, level: UILevel.PopUI },
    );
}

if (typeof globalThis !== "undefined") {
    (globalThis as {
        wrPayOneForThree?: {
            openHall: typeof openPayOneForThreeDialog;
            openGame: typeof openPayOneForThreeGameDialog;
        };
    }).wrPayOneForThree = {
        openHall: openPayOneForThreeDialog,
        openGame: openPayOneForThreeGameDialog,
    };
}

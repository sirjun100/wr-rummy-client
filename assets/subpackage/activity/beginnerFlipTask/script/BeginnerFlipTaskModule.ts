import { GameApp } from "../../../../script/game/GameApp";
import { AudioFxId } from "../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../script/game/config/BundleManifest";
import { AudioSystem } from "../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../script/game/system/UISystem";
import { UILevel } from "../../../../script/framework/toolkits/uiKit/UIKit";
import {
    BeginnerFlipGameOpenData,
    BeginnerFlipPageDto,
    BeginnerFlipRecordOpenData,
    BeginnerFlipTaskOpenData,
} from "./config/BeginnerFlipTaskConfig";
import { BeginnerFlipTaskModel } from "./model/BeginnerFlipTaskModel";
import { BeginnerFlipRecordDialog } from "./ui/BeginnerFlipRecordDialog";
import { BeginnerFlipTaskDialog } from "./ui/BeginnerFlipTaskDialog";
import { BeginnerFlipTaskGameDialog } from "./ui/BeginnerFlipTaskGameDialog";

let registered = false;

export function ensureBeginnerFlipTaskRegistered(): void {
    if (registered) {
        return;
    }
    GameApp.Interface.RegisterModel(new BeginnerFlipTaskModel());
    registered = true;
}

export async function openBeginnerFlipTaskDialog(
    uiData?: BeginnerFlipTaskOpenData,
): Promise<void> {
    ensureBeginnerFlipTaskRegistered();
    const audio = GameApp.Interface.GetSystem(AudioSystem);
    audio.playFx(AudioFxId.ActPopShow);
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(
        BeginnerFlipTaskDialog,
        BundleKey.BeginnerFlipTask,
        "BeginnerFlipTaskDialog",
        { uiData: uiData ?? new BeginnerFlipTaskOpenData(), level: UILevel.PopUI },
    );
}

export async function openBeginnerFlipRecordDialog(): Promise<void> {
    ensureBeginnerFlipTaskRegistered();
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(
        BeginnerFlipRecordDialog,
        BundleKey.BeginnerFlipTask,
        "BeginnerFlipRecordDialog",
        { uiData: new BeginnerFlipRecordOpenData(), level: UILevel.PopUI },
    );
}

export async function openBeginnerFlipGameDialog(
    source: BeginnerFlipPageDto,
    vid: string,
    tidKey: string,
): Promise<void> {
    ensureBeginnerFlipTaskRegistered();
    const audio = GameApp.Interface.GetSystem(AudioSystem);
    audio.playFx(AudioFxId.ActPopShow);
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(
        BeginnerFlipTaskGameDialog,
        BundleKey.BeginnerFlipTask,
        "BeginnerFlipTaskGameDialog",
        {
            uiData: new BeginnerFlipGameOpenData(source, vid, tidKey),
            level: UILevel.PopUI,
        },
    );
}

if (typeof globalThis !== "undefined") {
    (globalThis as { wrBeginnerFlipTask?: { open: typeof openBeginnerFlipTaskDialog } }).wrBeginnerFlipTask =
        {
            open: openBeginnerFlipTaskDialog,
        };
}

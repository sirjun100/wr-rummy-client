import { GameApp } from "../../../../script/game/GameApp";
import { AudioFxId } from "../../../../script/game/config/AudioFxId";
import { BundleKey, getManifestEntry } from "../../../../script/game/config/BundleManifest";
import { FetchMembershipPageCommand } from "../../../../script/game/commerce/command/FetchMembershipPageCommand";
import { FetchWalletSnapshotCommand } from "../../../../script/game/commerce/command/FetchWalletSnapshotCommand";
import { AudioSystem } from "../../../../script/game/system/AudioSystem";
import { BundleSystem } from "../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../script/game/system/UISystem";
import { UILevel } from "../../../../script/framework/toolkits/uiKit/UIKit";
import { UiAnimType } from "../../../../script/game/utility/UiAnimUtil";
import { FetchHallBootstrapCommand } from "./command/FetchHallBootstrapCommand";
import { RegisterHallPushCommand } from "./command/RegisterHallPushCommand";
import { HallConfigModel } from "./model/HallConfigModel";
import { HallPlayerModel } from "./model/HallPlayerModel";
import { SettingsPreferenceModel } from "./model/SettingsPreferenceModel";
import { CarteNodeView } from "./ui/CarteNodeView";

let hallRegistered = false;
let openPanel: CarteNodeView | null = null;

export function ensureHallRegistered(): void {
    if (hallRegistered) {
        return;
    }
    hallRegistered = true;
    GameApp.Interface.RegisterModel(new HallPlayerModel());
    GameApp.Interface.RegisterModel(new HallConfigModel());
    GameApp.Interface.RegisterModel(new SettingsPreferenceModel());
}

export function onHallLoginSuccess(): void {
    ensureHallRegistered();
    GameApp.Interface.SendCommand(new RegisterHallPushCommand());
    GameApp.Interface.SendCommand(new FetchHallBootstrapCommand());
}

export async function openCarte(): Promise<void> {
    ensureHallRegistered();
    await import("../../../commerce/wallet/script/PurseModule").then((m) => m.ensurePurseRegistered());
    const bundles = GameApp.Interface.GetSystem(BundleSystem);
    const manifestEntry = getManifestEntry(BundleKey.HallMenu);
    await bundles.loadBundle(manifestEntry?.bundleName ?? "hallMenu");
    GameApp.Interface.SendCommand(new FetchHallBootstrapCommand());
    GameApp.Interface.SendCommand(new FetchWalletSnapshotCommand());
    GameApp.Interface.SendCommand(new FetchMembershipPageCommand());
    const audio = GameApp.Interface.GetSystem(AudioSystem);
    audio.playFx(AudioFxId.ActPopShow);
    const ui = GameApp.Interface.GetSystem(UISystem);
    const panel = await ui.openDialogAsync(CarteNodeView, BundleKey.HallMenu, "CarteNode", {
        level: UILevel.PopUI,
        anim: UiAnimType.None,
    });
    openPanel = panel;
}

export async function closeCarte(): Promise<void> {
    if (openPanel) {
        openPanel.hideAnim();
        openPanel = null;
    }
}

if (typeof globalThis !== "undefined") {
    const api = { open: openCarte, close: closeCarte };
    const g = globalThis as {
        wrHallMenu?: typeof api;
        wrCarte?: typeof api;
    };
    g.wrHallMenu = api;
    g.wrCarte = api;
}

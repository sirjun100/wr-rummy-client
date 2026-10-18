import { GameApp } from "../../../../../script/game/GameApp";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { SixpointGameLogic } from "./SixpointGameLogic";
import { SixpointMoneyLessEvent } from "./event/SixpointEvents";
import { SixpointModel } from "./model/SixpointModel";
import { showSixpointToast } from "./utility/SixpointUiHelper";
import { SixpointNoseatPlayersDialog } from "./ui/dialogs/SixpointNoseatPlayersDialog";
import { SixpointNoseatRecodeDialog } from "./ui/dialogs/SixpointNoseatRecodeDialog";

let registered = false;
let moneyLessHooked = false;

export function ensureSixpointRegistered(): void {
    if (registered) {
        return;
    }
    GameApp.Interface.RegisterModel(new SixpointModel());
    SixpointGameLogic.bindPush();
    registered = true;
    if (!moneyLessHooked) {
        moneyLessHooked = true;
        GameApp.Interface.RegisterEvent(SixpointMoneyLessEvent, () => {
            showSixpointToast("Insufficient balance");
        }, GameApp.Interface);
    }
}

export function ensureSixpointDialogScripts(
    prefabRoot: import("cc").Node,
    dialog: "players" | "recode",
): void {
    if (dialog === "players" && !prefabRoot.getComponent(SixpointNoseatPlayersDialog)) {
        prefabRoot.addComponent(SixpointNoseatPlayersDialog);
    }
    if (dialog === "recode" && !prefabRoot.getComponent(SixpointNoseatRecodeDialog)) {
        prefabRoot.addComponent(SixpointNoseatRecodeDialog);
    }
}

export async function openSixpointDialog<T>(
    panel: new (...args: unknown[]) => T,
    prefabName: string,
    kind: "players" | "recode",
): Promise<T | null> {
    ensureSixpointRegistered();
    const ui = GameApp.Interface.GetSystem(UISystem);
    const dlg = await ui.openDialogAsync(panel as never, BundleKey.Sixpoint, prefabName, {
        level: UILevel.PopUI,
    });
    if (dlg?.node) {
        ensureSixpointDialogScripts(dlg.node, kind);
    }
    return dlg as T | null;
}

export async function openSixpointChatFromRummy(): Promise<void> {
    ensureSixpointRegistered();
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(BaseDialog, BundleKey.Rummy, "ChatAlertDialog", {
        level: UILevel.PopUI,
    });
}

declare global {
    interface Window {
        wrSixpoint?: {
            enter: () => void;
        };
        wrLobby?: {
            refreshHallActButtons?: (actIds: number[]) => void;
        };
    }
}

export function installSixpointGlobal(enter: () => void): void {
    globalThis.wrSixpoint = { enter };
}

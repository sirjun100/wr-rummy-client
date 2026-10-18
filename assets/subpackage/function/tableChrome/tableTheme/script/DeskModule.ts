import { Node } from "cc";
import { GameApp } from "../../../../script/game/GameApp";
import { AppBootstrapModel } from "../../../../script/game/model/AppBootstrapModel";
import { BundleKey, getManifestEntry } from "../../../../script/game/config/BundleManifest";
import { BundleSystem } from "../../../../script/game/system/BundleSystem";
import { PreloadDeskTexturesCommand } from "./command/PreloadDeskTexturesCommand";
import { DeskStyleModel } from "./model/DeskStyleModel";
import { RoomBgBinder } from "./ui/RoomBgBinder";
import type { DeskRoomContext } from "./config/DeskConfig";
import { PreChangeMatchRoomBgEvent } from "./event/PreChangeMatchRoomBgEvent";

let deskRegistered = false;

export function ensureDeskRegistered(): void {
    if (deskRegistered) {
        return;
    }
    deskRegistered = true;
    GameApp.Interface.RegisterModel(new DeskStyleModel());
    const model = GameApp.Interface.GetModel(DeskStyleModel);
    model.loadLocal();
    const bootstrap = GameApp.Interface.GetModel(AppBootstrapModel);
    if (bootstrap.remoteDeskUrl) {
        model.remoteDeskBaseUrl = bootstrap.remoteDeskUrl;
    }
}

export function onDeskLoginSuccess(): void {
    ensureDeskRegistered();
    const model = GameApp.Interface.GetModel(DeskStyleModel);
    const bootstrap = GameApp.Interface.GetModel(AppBootstrapModel);
    if (bootstrap.remoteDeskUrl) {
        model.remoteDeskBaseUrl = bootstrap.remoteDeskUrl;
    }
    GameApp.Interface.SendCommand(new PreloadDeskTexturesCommand());
    void import("../tableProps/script/PropsManageModule").then((m) => {
        m.ensurePropsRegistered();
        void import("../tableProps/script/command/FetchPropsPageCommand").then(({ FetchPropsPageCommand }) => {
            GameApp.Interface.SendCommand(new FetchPropsPageCommand());
        });
    });
}

/** Preload desk backgrounds used by Lobby / Transition scenes. */
export async function preloadDeskBundle(): Promise<void> {
    ensureDeskRegistered();
    const entry = getManifestEntry(BundleKey.TableTheme);
    if (!entry) {
        return;
    }
    await GameApp.Interface.GetSystem(BundleSystem).loadBundle(entry.bundleName);
}

export function attachRoomBgBinder(root: Node, context: DeskRoomContext): RoomBgBinder | null {
    ensureDeskRegistered();
    if (!root?.isValid) {
        return null;
    }
    let binder = root.getComponent(RoomBgBinder);
    if (!binder) {
        binder = root.addComponent(RoomBgBinder);
    }
    binder.roomContext = context;
    binder.resolveNodesIfNeeded();
    return binder;
}

export function wireRoomBgOnRoot(root: Node, context: DeskRoomContext): void {
    attachRoomBgBinder(root, context);
}

export function firePreChangeMatchRoomBg(): void {
    ensureDeskRegistered();
    GameApp.Interface.SendEvent(new PreChangeMatchRoomBgEvent());
}

if (typeof globalThis !== "undefined") {
    (globalThis as {
        wrDesk?: {
            preload: typeof preloadDeskBundle;
            onLogin: typeof onDeskLoginSuccess;
            wire: typeof wireRoomBgOnRoot;
        };
    }).wrDesk = {
        preload: preloadDeskBundle,
        onLogin: onDeskLoginSuccess,
        wire: wireRoomBgOnRoot,
    };

    (globalThis as Record<string, unknown>).wrTableTheme = (globalThis as Record<string, unknown>).wrDesk;
}

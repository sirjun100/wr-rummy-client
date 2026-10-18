import { EDITOR, sys } from "cc";
import { GameApp } from "../../../../script/game/GameApp";
import { AppBootstrapModel } from "../../../../script/game/model/AppBootstrapModel";
import { BundleSystem } from "../../../../script/game/system/BundleSystem";
import { StartTransitionCommand } from "./command/StartTransitionCommand";
import type { TransitionIntent } from "./config/TransitionProtocol";
import { TransitionFailedEvent } from "./event/TransitionFailedEvent";
import { TransitionModel } from "./model/TransitionModel";

let registered = false;

export function ensureTransitionRegistered(): void {
    if (registered) {
        return;
    }
    registered = true;
    GameApp.Interface.RegisterModel(new TransitionModel());
    GameApp.Interface.RegisterEvent(TransitionFailedEvent, (e) => {
        void import("../../../shared/commonUi/script/PublicModule").then((m) => {
            m.ensurePublicRegistered();
            const msg = e.error instanceof Error ? e.error.message : String(e.error);
            m.showAlert({ title: "", content: msg });
        });
    });
}

export function shouldUseTransition(): boolean {
    const bootstrap = GameApp.Interface.GetModel(AppBootstrapModel);
    if (bootstrap.transition.enabled === false) {
        return false;
    }
    if (bootstrap.transition.skip_in_editor && (EDITOR || sys.isBrowser)) {
        return false;
    }
    return true;
}

export function startTransition(intent: TransitionIntent): void {
    ensureTransitionRegistered();
    GameApp.Interface.SendCommand(new StartTransitionCommand(intent));
}

export async function preloadTransitionBundle(): Promise<void> {
    await GameApp.Interface.GetSystem(BundleSystem).loadBundle("sceneSwitch");
}

if (typeof globalThis !== "undefined") {
    const api = {
        start: startTransition,
        preload: preloadTransitionBundle,
        shouldUse: shouldUseTransition,
        ensureRegistered: ensureTransitionRegistered,
    };
    const g = globalThis as {
        wrSceneSwitch?: typeof api;
        wrTransition?: typeof api;
    };
    g.wrSceneSwitch = api;
    g.wrTransition = api;
}

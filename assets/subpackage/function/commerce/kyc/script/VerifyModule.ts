import { GameApp } from "../../../../script/game/GameApp";
import { BundleSystem } from "../../../../script/game/system/BundleSystem";
import { ensurePurseRegistered } from "../wallet/script/PurseModule";
import { OpenKycDialogCommand } from "./command/OpenKycDialogCommand";
import { OpenPersonBindDialogCommand } from "./command/OpenPersonBindDialogCommand";
import type { PersonBindOpenData } from "./config/VerifyProtocol";
import { VerifyModel } from "./model/VerifyModel";
import { promptKycIfNeeded as gatePrompt } from "./utility/VerifyKycGate";

let registered = false;

export function ensureVerifyRegistered(): void {
    if (registered) {
        return;
    }
    registered = true;
    ensurePurseRegistered();
    GameApp.Interface.RegisterModel(new VerifyModel());
}

export function openKycPhoto(): Promise<void> {
    ensureVerifyRegistered();
    GameApp.Interface.SendCommand(new OpenKycDialogCommand());
    return Promise.resolve();
}

export function openPersonMsgBind(bindType: PersonBindOpenData = "tel"): Promise<void> {
    ensureVerifyRegistered();
    GameApp.Interface.SendCommand(new OpenPersonBindDialogCommand(bindType));
    return Promise.resolve();
}

export async function preloadVerifyBundle(): Promise<void> {
    ensureVerifyRegistered();
    await GameApp.Interface.GetSystem(BundleSystem).loadBundle("kyc");
}

export function promptKycGate(kycCheck?: number, toastMessage?: string): Promise<boolean> {
    ensureVerifyRegistered();
    return gatePrompt(kycCheck, toastMessage);
}

if (typeof globalThis !== "undefined") {
    const api = {
        ensureRegistered: ensureVerifyRegistered,
        preload: preloadVerifyBundle,
        openKycPhoto,
        openPersonMsgBind,
        promptKycGate,
    };
    const g = globalThis as { wrKyc?: typeof api; wrVerify?: typeof api };
    g.wrKyc = api;
    g.wrVerify = api;
}

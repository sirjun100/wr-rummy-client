import { GameApp } from "../../../../script/game/GameApp";
import { NetworkDelayModel } from "./model/NetworkDelayModel";
import { NetworkDelaySystem } from "./system/NetworkDelaySystem";
import { AttachNetworkDelayOverlayCommand } from "./command/AttachNetworkDelayOverlayCommand";
import { DetachNetworkDelayOverlayCommand } from "./command/DetachNetworkDelayOverlayCommand";
import { ShowNetworkDelayOverlayCommand } from "./command/ShowNetworkDelayOverlayCommand";
let registered = false;

export function ensureNetworkDelayRegistered(): void {
    if (registered) {
        return;
    }
    registered = true;
    GameApp.Interface.RegisterModel(new NetworkDelayModel());
    GameApp.Interface.RegisterSystem(new NetworkDelaySystem());
}

export function attachNetworkDelayOverlay(): void {
    ensureNetworkDelayRegistered();
    GameApp.Interface.SendCommand(new AttachNetworkDelayOverlayCommand());
}

export function detachNetworkDelayOverlay(): void {
    ensureNetworkDelayRegistered();
    GameApp.Interface.SendCommand(new DetachNetworkDelayOverlayCommand());
}

export function showNetworkDelayOverlay(visible: boolean): void {
    ensureNetworkDelayRegistered();
    GameApp.Interface.SendCommand(new ShowNetworkDelayOverlayCommand(visible));
}

export function setActiveDisconnect(active: boolean): void {
    ensureNetworkDelayRegistered();
    GameApp.Interface.GetModel(NetworkDelayModel).activeDisconnect = active;
}

function installApi(): void {
    const g = globalThis as { wrNetworkDelay?: Record<string, unknown> };
    const api = {
        attach: attachNetworkDelayOverlay,
        detach: detachNetworkDelayOverlay,
        showOverlay: showNetworkDelayOverlay,
        setActiveDisconnect,
        ensureRegistered: ensureNetworkDelayRegistered,
    };
    g.wrNetworkDelay = api;
    (globalThis as { wrNetworkOverlay?: Record<string, unknown> }).wrNetworkOverlay = api;
}

installApi();

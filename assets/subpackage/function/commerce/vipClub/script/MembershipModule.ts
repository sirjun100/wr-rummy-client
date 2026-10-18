import { GameApp } from "../../../../script/game/GameApp";
import { AudioFxId } from "../../../../script/game/config/AudioFxId";
import { BundleKey, getManifestEntry } from "../../../../script/game/config/BundleManifest";
import { ensurePurseRegistered } from "../wallet/script/PurseModule";
import { AudioSystem } from "../../../../script/game/system/AudioSystem";
import { BundleSystem } from "../../../../script/game/system/BundleSystem";
import { UILevel } from "../../../../script/framework/toolkits/uiKit/UIKit";
import { MembershipModel } from "./model/MembershipModel";
import { OpenMembershipDialogCommand } from "./command/OpenMembershipDialogCommand";
import { OpenMembershipUpgradeDialogCommand } from "./command/OpenMembershipUpgradeDialogCommand";
import { FetchMembershipClubPageCommand } from "./command/FetchMembershipClubPageCommand";
import { RegisterMembershipPushCommand } from "./command/RegisterMembershipPushCommand";

let registered = false;

export function ensureMembershipRegistered(): void {
    if (registered) {
        return;
    }
    registered = true;
    GameApp.Interface.RegisterModel(new MembershipModel());
    GameApp.Interface.SendCommand(new RegisterMembershipPushCommand());
}

async function preloadMembership(): Promise<void> {
    ensureMembershipRegistered();
    ensurePurseRegistered();
    const entry = getManifestEntry(BundleKey.VipClub);
    if (entry) {
        await GameApp.Interface.GetSystem(BundleSystem).loadBundle(entry.bundleName);
    }
    GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
}

export async function openMembership(): Promise<void> {
    await preloadMembership();
    GameApp.Interface.SendCommand(new OpenMembershipDialogCommand());
}

export async function openMembershipUpgrade(inGame: boolean): Promise<void> {
    await preloadMembership();
    GameApp.Interface.SendCommand(new OpenMembershipUpgradeDialogCommand(inGame));
}

export function refreshClubPage(): void {
    ensureMembershipRegistered();
    GameApp.Interface.SendCommand(new FetchMembershipClubPageCommand());
}

export function installWrMembershipApi(): void {
    const g = globalThis as { wrMembership?: Record<string, unknown> };
    const api = {
        open: openMembership,
        openUpgrade: openMembershipUpgrade,
        refreshClubPage,
        ensureRegistered: ensureMembershipRegistered,
    };
    g.wrMembership = api;
    (globalThis as { wrVipClub?: Record<string, unknown> }).wrVipClub = api;
}

installWrMembershipApi();

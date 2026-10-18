import { GameApp } from "../../../../script/game/GameApp";
import { BundleKey, getManifestEntry } from "../../../../script/game/config/BundleManifest";
import { BundleSystem } from "../../../../script/game/system/BundleSystem";
import { GameActLeaderboardOpenData } from "./config/GameActLeaderboardProtocol";
import { FetchRoomChallengerPageCommand } from "./command/FetchRoomChallengerPageCommand";
import { OpenGameActLeaderboardCommand } from "./command/OpenGameActLeaderboardCommand";
import { SubmitChallengerOptInCommand } from "./command/SubmitChallengerOptInCommand";
import { GameActLeaderboardModel } from "./model/GameActLeaderboardModel";

let registered = false;

export function ensureGameActLeaderboardRegistered(): void {
    if (registered) {
        return;
    }
    registered = true;
    GameApp.Interface.RegisterModel(new GameActLeaderboardModel());
}

export function prefetchRoomPage(vid: number): void {
    ensureGameActLeaderboardRegistered();
    GameApp.Interface.SendCommand(new FetchRoomChallengerPageCommand(vid, "hour", 1, false));
}

export function openRoomChallenger(data?: GameActLeaderboardOpenData): void {
    ensureGameActLeaderboardRegistered();
    const open = data ?? new GameActLeaderboardOpenData(0, "");
    void preloadGameActLeaderboardBundle().then(() => {
        GameApp.Interface.SendCommand(new OpenGameActLeaderboardCommand(open));
    });
}

export function submitChallengerOptIn(vid: number): void {
    ensureGameActLeaderboardRegistered();
    GameApp.Interface.SendCommand(new SubmitChallengerOptInCommand(vid));
}

async function preloadGameActLeaderboardBundle(): Promise<void> {
    const entry = getManifestEntry(BundleKey.RoomLeaderboard);
    if (!entry) {
        return;
    }
    await GameApp.Interface.GetSystem(BundleSystem).loadBundle(entry.bundleName);
}

/** @deprecated use openRoomChallenger */
export async function openGameActLeaderboardPrefab(): Promise<void> {
    openRoomChallenger();
}

if (typeof globalThis !== "undefined") {
    (globalThis as {
        wrGameActRank?: {
            open: typeof openRoomChallenger;
            prefetch: typeof prefetchRoomPage;
            optIn: typeof submitChallengerOptIn;
        };
    }).wrGameActRank = {
        open: openRoomChallenger,
        prefetch: prefetchRoomPage,
        optIn: submitChallengerOptIn,
    };

    (globalThis as Record<string, unknown>).wrRoomLeaderboard = (globalThis as Record<string, unknown>).wrGameActRank;
}

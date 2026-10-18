import { GameApp } from "../../../../script/game/GameApp";
import { FetchHallRankMainCommand } from "./command/FetchHallRankMainCommand";
import { OpenRankingsDialogCommand } from "./command/OpenRankingsDialogCommand";
import { OpenRankingsEndTipCommand } from "./command/OpenRankingsEndTipCommand";
import { OpenRankingsOptinDialogCommand } from "./command/OpenRankingsOptinDialogCommand";
import { OpenRankingsPopActCommand } from "./command/OpenRankingsPopActCommand";
import type { RankingsEndTipData, RankingsOptinData, RankingsPopActData } from "./config/RankingsProtocol";
import { RankingsModel } from "./model/RankingsModel";
import { enqueueLobbyActivity } from "../inviteShare/script/utility/LobbyActivityQueue";

let registered = false;

export function ensureRankingsRegistered(): void {
    if (registered) {
        return;
    }
    registered = true;
    GameApp.Interface.RegisterModel(new RankingsModel());
}

export function prefetchRankingsMain(): void {
    ensureRankingsRegistered();
    GameApp.Interface.SendCommand(new FetchHallRankMainCommand());
}

export function openRankingsDialog(): void {
    ensureRankingsRegistered();
    GameApp.Interface.SendCommand(new OpenRankingsDialogCommand());
}

export function openRankingsPopAct(data: RankingsPopActData): void {
    ensureRankingsRegistered();
    enqueueLobbyActivity(() => {
        GameApp.Interface.SendCommand(new OpenRankingsPopActCommand(data));
    });
}

export function openRankingsEndTip(data: RankingsEndTipData): void {
    ensureRankingsRegistered();
    enqueueLobbyActivity(() => {
        GameApp.Interface.SendCommand(new OpenRankingsEndTipCommand(data));
    });
}

export function openRankingsOptin(data: RankingsOptinData, onStatus?: (status: number) => void): void {
    ensureRankingsRegistered();
    GameApp.Interface.SendCommand(new OpenRankingsOptinDialogCommand(data, onStatus));
}

if (typeof globalThis !== "undefined") {
    (globalThis as {
        wrRankings?: {
            open: typeof openRankingsDialog;
            openPopAct: typeof openRankingsPopAct;
            openEndTip: typeof openRankingsEndTip;
            openOptin: typeof openRankingsOptin;
            prefetchMain: typeof prefetchRankingsMain;
            ensureRegistered: typeof ensureRankingsRegistered;
        };
    }).wrRankings = {
        open: openRankingsDialog,
        openPopAct: openRankingsPopAct,
        openEndTip: openRankingsEndTip,
        openOptin: openRankingsOptin,
        prefetchMain: prefetchRankingsMain,
        ensureRegistered: ensureRankingsRegistered,
    };

    (globalThis as Record<string, unknown>).wrHallLeaderboard = (globalThis as Record<string, unknown>).wrRankings;
}

import { GameApp } from "../../../../script/game/GameApp";
import { BundleKey } from "../../../../script/game/config/BundleManifest";
import { UILevel } from "../../../../script/framework/toolkits/uiKit/UIKit";
import { UISystem } from "../../../../script/game/system/UISystem";
import { ensureHallRegistered } from "../../hallMenu/script/CarteModule";
import { FetchHallBootstrapCommand } from "../../hallMenu/script/command/FetchHallBootstrapCommand";
import { FetchHallHomeCommand } from "./command/FetchHallHomeCommand";
import type { HallHomeReq, TableInProgressDto } from "./config/LobbyProtocol";
import { LobbyModel } from "./model/LobbyModel";
import { HallActivityRouter } from "./utility/HallActivityRouter";
import type { LobbySceneController } from "./controller/LobbySceneController";
import { GameAlreadyJoinedDialog } from "./ui/dialogs/GameAlreadyJoinedDialog";

let lobbyRegistered = false;

export type WrLobbyApi = {
    onLobbyEnter?: typeof onLobbyEnter;
    refreshFromHallHome?: typeof refreshFromHallHome;
    refreshHallActButtons?: (actIds: number[]) => void;
    setHallActButtonVisible?: (nodeName: string, on: boolean) => void;
    openActivityCenter?: () => Promise<void>;
    openEmailMain?: () => Promise<void>;
    openAnnouncement?: () => Promise<void>;
    openShare?: () => void;
    openInviteTab?: () => void;
    openSharePopAct?: (data?: Record<string, unknown>) => Promise<void>;
    openRankings?: () => void;
    openRankingsPopAct?: (data?: Record<string, unknown>) => void;
    openPropsManage?: () => Promise<void>;
    openPropsRoom?: () => Promise<void>;
    openMenu?: () => Promise<void>;
    openShop?: () => Promise<void>;
    openFastBuy?: () => Promise<void>;
    openGameAlreadyJoined?: (tables?: TableInProgressDto[]) => Promise<void>;
    openByActId?: (actId: number, ext?: unknown) => Promise<void>;
};

let sceneRef: LobbySceneController | null = null;

export function ensureLobbyRegistered(): void {
    if (lobbyRegistered) {
        return;
    }
    lobbyRegistered = true;
    GameApp.Interface.RegisterModel(new LobbyModel());
    installWrLobbyShell();
}

export function bindLobbyScene(controller: LobbySceneController): void {
    sceneRef = controller;
    installWrLobbyShell();
}

export function onLobbyEnter(isBackToHall = 0, vid = 0): void {
    ensureLobbyRegistered();
    ensureHallRegistered();
    GameApp.Interface.SendCommand(new FetchHallBootstrapCommand({ chainHallHome: { is_back_to_hall: isBackToHall, vid } }));
    void import("../../roomSelect/script/SelectionVenueModule").then((m) => m.prefetchRoomCatalog());
}

export function openRummySelection(): void {
    void import("../../roomSelect/script/SelectionVenueModule").then((m) => m.openRummySelection());
}

export function refreshFromHallHome(req?: HallHomeReq): void {
    ensureLobbyRegistered();
    GameApp.Interface.SendCommand(new FetchHallHomeCommand(req ?? {}, true));
}

export async function openGameAlreadyJoined(tables?: TableInProgressDto[]): Promise<void> {
    ensureLobbyRegistered();
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(GameAlreadyJoinedDialog, BundleKey.Lobby, "GameAlreadyJoinedDialog", {
        level: UILevel.PopUI,
        uiData: tables ?? [],
    });
}

function installWrLobbyShell(): void {
    if (typeof globalThis === "undefined") {
        return;
    }
    const prev = (globalThis as { wrLobby?: WrLobbyApi }).wrLobby ?? {};
    (globalThis as { wrLobby?: WrLobbyApi }).wrLobby = {
        ...prev,
        onLobbyEnter,
        refreshFromHallHome,
        openByActId: (actId, ext) => HallActivityRouter.openByActId(actId, ext),
        openGameAlreadyJoined,
        openActivityCenter: () => import("../../hallHeader/script/LobbyTopViewModule").then((m) => m.openActivityCenter()),
        openEmailMain: () => import("../../hallHeader/script/LobbyTopViewModule").then((m) => m.openEmailMain()),
        openAnnouncement: () => import("../../hallHeader/script/LobbyTopViewModule").then((m) => m.openAnnouncement()),
        openRankings: () => {
            void import("../../../social/hallLeaderboard/script/RankingsModule").then((m) => m.openRankingsDialog());
        },
        openRankingsPopAct: (data) => {
            void import("../../../social/hallLeaderboard/script/RankingsModule").then((m) =>
                m.openRankingsPopAct((data ?? {}) as import("../../../social/hallLeaderboard/script/config/RankingsProtocol").RankingsPopActData),
            );
        },
        openPropsManage: () => import("../../../tableChrome/tableProps/script/PropsManageModule").then((m) => m.openPropsManageDialog()),
        openPropsRoom: () => import("../../../tableChrome/tableProps/script/PropsManageModule").then((m) => m.openPropsRoomDialog()),
        openMenu: () => import("../../hallMenu/script/CarteModule").then((m) => m.openCarte()),
        openShop: () => import("../../../commerce/wallet/script/PurseModule").then((m) => m.openShopMain()),
        openFastBuy: () => import("../../../commerce/quickRecharge/script/FastBuyModule").then((m) => m.openHallFastBuy()),
        openSharePopAct: (data) => import("../../../social/inviteShare/script/CommShareModule").then((m) => m.openSharePopAct(data)),
        openShare: () => sceneRef?.openInviteTab(),
        openInviteTab: () => sceneRef?.openInviteTab(),
        refreshHallActButtons: (actIds) => sceneRef?.refreshHallActButtons(actIds),
        setHallActButtonVisible: (nodeName, on) => sceneRef?.setHallActButtonVisible(nodeName, on),
    };
}

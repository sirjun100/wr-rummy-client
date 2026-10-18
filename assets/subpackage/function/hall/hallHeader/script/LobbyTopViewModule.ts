import { GameApp } from "../../../../script/game/GameApp";
import { AudioFxId } from "../../../../script/game/config/AudioFxId";
import { BundleKey, getManifestEntry } from "../../../../script/game/config/BundleManifest";
import { AudioSystem } from "../../../../script/game/system/AudioSystem";
import { BundleSystem } from "../../../../script/game/system/BundleSystem";
import type { AnnounceDto, OpenAnnouncementData, OpenMatchDetailsData } from "./config/LobbyTopViewProtocol";
import { FetchAnnounceNextCommand } from "./command/FetchAnnounceNextCommand";
import { OpenActivityCenterCommand } from "./command/OpenActivityCenterCommand";
import { OpenAnnouncementCommand } from "./command/OpenAnnouncementCommand";
import { OpenEmailMainCommand } from "./command/OpenEmailMainCommand";
import { OpenMatchDetailsCommand } from "./command/OpenMatchDetailsCommand";
import { OpenUpdateGuideCommand } from "./command/OpenUpdateGuideCommand";
import { LobbyTopViewModel } from "./model/LobbyTopViewModel";
import { RedemptionCodeDialog } from "./ui/RedemptionCodeDialog";
import { UILevel } from "../../../../script/framework/toolkits/uiKit/UIKit";
import { UISystem } from "../../../../script/game/system/UISystem";
import { LobbyTopViewPrefab } from "./config/LobbyTopViewConfig";

let registered = false;

export function ensureLobbyTopViewRegistered(): void {
    if (registered) {
        return;
    }
    registered = true;
    GameApp.Interface.RegisterModel(new LobbyTopViewModel());
}

async function preloadBundle(): Promise<void> {
    ensureLobbyTopViewRegistered();
    const entry = getManifestEntry(BundleKey.HallHeader);
    if (!entry) {
        return;
    }
    await GameApp.Interface.GetSystem(BundleSystem).loadBundle(entry.bundleName);
    GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
}

export async function openActivityCenter(): Promise<void> {
    await preloadBundle();
    GameApp.Interface.SendCommand(new OpenActivityCenterCommand());
}

export async function openEmailMain(): Promise<void> {
    await preloadBundle();
    GameApp.Interface.SendCommand(new OpenEmailMainCommand());
}

export async function openMatchDetails(data?: OpenMatchDetailsData): Promise<void> {
    await preloadBundle();
    GameApp.Interface.SendCommand(new OpenMatchDetailsCommand(data ?? { tournamentId: 1 }));
}

export async function openInboxDetail(): Promise<void> {
    await openEmailMain();
}

export async function openRedemptionCode(): Promise<void> {
    await preloadBundle();
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(RedemptionCodeDialog, BundleKey.HallHeader, LobbyTopViewPrefab.RedemptionCode, {
        level: UILevel.PopUI,
    });
}

export async function openUpdateGuide(data?: OpenAnnouncementData): Promise<void> {
    await preloadBundle();
    if (data) {
        GameApp.Interface.SendCommand(new OpenUpdateGuideCommand(data));
        return;
    }
    GameApp.Interface.SendCommand(new FetchAnnounceNextCommand(true));
}

export async function openAnnouncement(data?: OpenAnnouncementData | AnnounceDto): Promise<void> {
    await preloadBundle();
    if (data && "announce" in data) {
        GameApp.Interface.SendCommand(new OpenAnnouncementCommand(data));
        return;
    }
    if (data && "title" in data) {
        GameApp.Interface.SendCommand(new OpenAnnouncementCommand({ announce: data, isNext: false }));
        return;
    }
    GameApp.Interface.SendCommand(new FetchAnnounceNextCommand(true));
}

export function enqueueAnnounceOnLobbyEnter(): void {
    ensureLobbyTopViewRegistered();
    GameApp.Interface.SendCommand(new FetchAnnounceNextCommand(true));
}

if (typeof globalThis !== "undefined") {
    (globalThis as {
        wrLobbyTopView?: {
            openActivityCenter: typeof openActivityCenter;
            openEmailMain: typeof openEmailMain;
            openMatchDetails: typeof openMatchDetails;
            openInboxDetail: typeof openInboxDetail;
            openRedemptionCode: typeof openRedemptionCode;
            openUpdateGuide: typeof openUpdateGuide;
            openAnnouncement: typeof openAnnouncement;
        };
    }).wrLobbyTopView = {
        openActivityCenter,
        openEmailMain,
        openMatchDetails,
        openInboxDetail,
        openRedemptionCode,
        openUpdateGuide,
        openAnnouncement,
    };

    (globalThis as Record<string, unknown>).wrHallHeader = (globalThis as Record<string, unknown>).wrLobbyTopView;
}

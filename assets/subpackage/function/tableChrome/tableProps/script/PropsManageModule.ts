import { GameApp } from "../../../../script/game/GameApp";
import { AudioFxId } from "../../../../script/game/config/AudioFxId";
import { BundleKey, getManifestEntry } from "../../../../script/game/config/BundleManifest";
import { AudioSystem } from "../../../../script/game/system/AudioSystem";
import { BundleSystem } from "../../../../script/game/system/BundleSystem";
import { OpenPropsManageDialogCommand } from "./command/OpenPropsManageDialogCommand";
import { OpenPropsRoomDialogCommand } from "./command/OpenPropsRoomDialogCommand";
import { FetchPropsPageCommand } from "./command/FetchPropsPageCommand";
import { ensureDeskRegistered } from "../tableTheme/script/DeskModule";
import { PropsManageModel } from "./model/PropsManageModel";

let propsRegistered = false;

export function ensurePropsRegistered(): void {
    if (propsRegistered) {
        return;
    }
    propsRegistered = true;
    ensureDeskRegistered();
    GameApp.Interface.RegisterModel(new PropsManageModel());
}

async function preloadPropsBundle(): Promise<void> {
    ensurePropsRegistered();
    const entry = getManifestEntry(BundleKey.TableProps);
    if (entry) {
        await GameApp.Interface.GetSystem(BundleSystem).loadBundle(entry.bundleName);
    }
    GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
}

export async function openPropsManageDialog(): Promise<void> {
    await preloadPropsBundle();
    GameApp.Interface.SendCommand(new OpenPropsManageDialogCommand());
}

export async function openPropsRoomDialog(): Promise<void> {
    await preloadPropsBundle();
    GameApp.Interface.SendCommand(new OpenPropsRoomDialogCommand());
}

export function refreshPropsPage(): void {
    ensurePropsRegistered();
    GameApp.Interface.SendCommand(new FetchPropsPageCommand());
}

if (typeof globalThis !== "undefined") {
    (globalThis as {
        wrPropsManage?: {
            open: typeof openPropsManageDialog;
            openRoom: typeof openPropsRoomDialog;
            refreshPage: typeof refreshPropsPage;
            ensureRegistered: typeof ensurePropsRegistered;
        };
    }).wrPropsManage = {
        open: openPropsManageDialog,
        openRoom: openPropsRoomDialog,
        refreshPage: refreshPropsPage,
        ensureRegistered: ensurePropsRegistered,
    };

    (globalThis as Record<string, unknown>).wrTableProps = (globalThis as Record<string, unknown>).wrPropsManage;
}

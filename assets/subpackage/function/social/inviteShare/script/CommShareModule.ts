import { instantiate, Node, Prefab } from "cc";
import { GameApp } from "../../../../script/game/GameApp";
import { AudioFxId } from "../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../script/game/config/BundleManifest";
import { HallPlayerModel } from "../../../hall/hallMenu/script/model/HallPlayerModel";
import { AudioSystem } from "../../../../script/game/system/AudioSystem";
import { BundleSystem } from "../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../script/game/system/UISystem";
import { UILevel } from "../../../../script/framework/toolkits/uiKit/UIKit";
import { UiAnimType } from "../../../../script/game/utility/UiAnimUtil";
import { FetchSharePageCommand } from "./command/FetchSharePageCommand";
import { PrefetchSharePageCommand } from "./command/PrefetchSharePageCommand";
import { RegisterSharePushCommand } from "./command/RegisterSharePushCommand";
import type { SharePopDto } from "./config/ShareConfig";
import { ShareModel } from "./model/ShareModel";
import { ShareMainPageDialog } from "./ui/ShareMainPageDialog";
import { SharePopActDialog, type SharePopActUiData } from "./ui/SharePopActDialog";

let shareRegistered = false;
let embeddedPanel: ShareMainPageDialog | null = null;

export function ensureCommShareRegistered(): void {
    if (shareRegistered) {
        return;
    }
    shareRegistered = true;
    const model = new ShareModel();
    GameApp.Interface.RegisterModel(model);
    syncShareFlagsFromHall();
    GameApp.Interface.SendCommand(new RegisterSharePushCommand());
}

export function clearShareModelIfRegistered(): void {
    if (!shareRegistered) {
        return;
    }
    GameApp.Interface.GetModel(ShareModel).clear();
}

export function syncShareFlagsFromHall(): void {
    try {
        const hall = GameApp.Interface.GetModel(HallPlayerModel);
        const p = hall.player.value;
        GameApp.Interface.GetModel(ShareModel).applyHallFlags(p.hall_invite_earn, p.has_invite_reward);
    } catch {
        /* hall not registered yet */
    }
}

export function onShareLoginSuccess(): void {
    ensureCommShareRegistered();
    GameApp.Interface.SendCommand(new PrefetchSharePageCommand());
}

export async function preloadCommShare(): Promise<void> {
    const bundles = GameApp.Interface.GetSystem(BundleSystem);
    await bundles.loadBundle("comm_share");
}

export async function openShareMain(options?: { host?: Node; asDialog?: boolean }): Promise<void> {
    ensureCommShareRegistered();
    syncShareFlagsFromHall();
    await preloadCommShare();
    GameApp.Interface.SendCommand(new FetchSharePageCommand(true));
    const audio = GameApp.Interface.GetSystem(AudioSystem);
    audio.playFx(AudioFxId.ActPopShow);

    const host = options?.host;
    const asDialog = options?.asDialog ?? !host;
    if (host && !asDialog) {
        if (host.getChildByName("ShareMain")) {
            host.getChildByName("ShareMain")!.active = true;
            return;
        }
        const bundles = GameApp.Interface.GetSystem(BundleSystem);
        const bundle = await bundles.loadBundle("comm_share");
        const prefab = await new Promise<Prefab | null>((resolve) => {
            bundle.load("prefab/ShareMainPageDialog", Prefab, (err, asset) => {
                if (err || !asset) {
                    resolve(null);
                    return;
                }
                resolve(asset);
            });
        });
        if (!prefab) {
            return;
        }
        const node = instantiate(prefab);
        node.name = "ShareMain";
        host.addChild(node);
        embeddedPanel = node.getComponent(ShareMainPageDialog);
        embeddedPanel?.setEmbeddedMode(true);
        return;
    }

    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(ShareMainPageDialog, BundleKey.InviteShare, "ShareMainPageDialog", {
        level: UILevel.PopUI,
        anim: UiAnimType.SlideInRight,
    });
}

export async function openSharePopAct(payload?: SharePopDto): Promise<void> {
    ensureCommShareRegistered();
    await preloadCommShare();
    const audio = GameApp.Interface.GetSystem(AudioSystem);
    audio.playFx(AudioFxId.ActPopShow);
    const ui = GameApp.Interface.GetSystem(UISystem);
    const uiData: SharePopActUiData = { payload };
    await ui.openDialogAsync(SharePopActDialog, BundleKey.InviteShare, "SharePopActDialog", {
        level: UILevel.PopUI,
        uiData,
    });
}

export function hideEmbeddedShare(): void {
    if (embeddedPanel?.node?.isValid) {
        embeddedPanel.node.active = false;
    }
}

if (typeof globalThis !== "undefined") {
    (globalThis as { wrCommShare?: Record<string, unknown> }).wrCommShare = {
        openMain: openShareMain,
        openPopAct: openSharePopAct,
        preload: preloadCommShare,
    };

    (globalThis as Record<string, unknown>).wrInviteShare = (globalThis as Record<string, unknown>).wrCommShare;
}

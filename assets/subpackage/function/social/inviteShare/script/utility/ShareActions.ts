import { GameApp } from "../../GameApp";
import { PlatformSystem } from "../../../../../script/game/system/PlatformSystem";

export function shareWhatsApp(shareText: string, shareUrl: string): void {
    const platform = GameApp.Interface.GetSystem(PlatformSystem);
    const body = `${shareText} ${shareUrl}`.trim();
    platform.shareTextToWhatsApp(body);
}

export function shareLinkCopy(shareText: string, shareUrl: string): void {
    const platform = GameApp.Interface.GetSystem(PlatformSystem);
    const body = `${shareText} ${shareUrl}`.trim();
    platform.shareWebPage(body);
    platform.copyToClipboard(body);
}

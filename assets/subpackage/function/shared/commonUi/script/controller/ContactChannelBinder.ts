import { Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { PlatformSystem } from "../../../../../script/game/system/PlatformSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import type { SupportChannelsDto } from "../config/PublicProtocol";
import { findNodeByName, wireButtonByName } from "../utility/PublicDialogUtil";

function bindChannelRow(
    root: Node,
    rowName: string,
    value: string,
    onCopy: (text: string) => void,
    onOpen?: (text: string) => void,
): void {
    const row = findNodeByName(root, rowName);
    if (!row) {
        return;
    }
    const text = value.trim();
    if (!text) {
        row.active = false;
        return;
    }
    row.active = true;
    const itemText = findNodeByName(row, "item_text");
    const lab = itemText?.getComponent(Label);
    if (lab) {
        lab.string = text;
    }
    wireButtonByName(row, "copy_btn", () => {
        if (onOpen) {
            onOpen(text);
        } else {
            onCopy(text);
        }
    }, root);
}

export function bindContactChannels(root: Node, channels: SupportChannelsDto): void {
    const platform = GameApp.Interface.GetSystem(PlatformSystem);
    const ui = GameApp.Interface.GetSystem(UISystem);
    const copy = (t: string) => {
        platform.copyToClipboard(t);
        ui.showToast("Copied");
    };
    bindChannelRow(root, "email", channels.email ?? "", copy);
    bindChannelRow(root, "whatsapp", channels.whatsapp ?? "", copy, (t) => {
        if (platform.isPackageInstalled("com.whatsapp")) {
            platform.shareTextToWhatsApp(t);
        } else {
            copy(t);
        }
    });
    bindChannelRow(root, "telegram", channels.telegram ?? "", copy, (t) => {
        const handle = t.startsWith("@") ? t.slice(1) : t;
        if (handle) {
            if (typeof window !== "undefined") {
                window.open(`https://t.me/${handle}`, "_blank");
            }
        } else {
            copy(t);
        }
    });
}

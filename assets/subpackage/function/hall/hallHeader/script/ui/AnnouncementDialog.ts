import { _decorator, Label } from "cc";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import type { OpenAnnouncementData } from "../config/LobbyTopViewProtocol";
import { runNextLobbyActivity } from "../../../../social/inviteShare/script/utility/LobbyActivityQueue";

const { ccclass } = _decorator;

@ccclass("AnnouncementDialog")
export class AnnouncementDialog extends BaseDialog {
    private isNext = false;

    protected OnInit(uiData: OpenAnnouncementData | null): void {
        const data = uiData?.announce;
        this.isNext = uiData?.isNext ?? false;
        const title = this.findLabel("titleLabel") ?? this.findLabel("title");
        const content = this.findLabel("contentLabel") ?? this.findLabel("content");
        if (title && data?.title) {
            title.string = data.title;
        }
        if (content && data?.content) {
            content.string = data.content;
        }
        this.wireByName("btn_close", () => this.onClose());
        this.wireByName("close", () => this.onClose());
    }

    protected OnClose(): void {
        if (this.isNext) {
            runNextLobbyActivity();
        }
    }

    private onClose(): void {
        this.CloseSelf();
    }

    private findLabel(name: string): Label | null {
        const stack = [this.node];
        while (stack.length) {
            const n = stack.pop()!;
            if (n.name === name) {
                return n.getComponent(Label);
            }
            for (const c of n.children) {
                stack.push(c);
            }
        }
        return null;
    }

    private wireByName(name: string, fn: () => void): void {
        const stack = [this.node];
        while (stack.length) {
            const n = stack.pop()!;
            if (n.name === name) {
                n.on("click", fn, this);
            }
            for (const c of n.children) {
                stack.push(c);
            }
        }
    }
}

import { _decorator, Component, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import type { MailItemDto } from "../config/LobbyTopViewProtocol";
import { InboxClaimCommand } from "../command/InboxClaimCommand";

const { ccclass } = _decorator;

@ccclass("InboxDetailPanel")
export class InboxDetailPanel extends Component {
    public show(item: MailItemDto): void {
        this.node.active = true;
        const title = this.findDeep("title")?.getComponent(Label);
        const content = this.findDeep("content")?.getComponent(Label) ?? this.findDeep("info")?.getComponent(Label);
        if (title) {
            title.string = item.title ?? "";
        }
        if (content) {
            content.string = item.content ?? "";
        }
        this.wireByName("claim", () => GameApp.Interface.SendCommand(new InboxClaimCommand(item.eid)));
        this.wireByName("btn_close", () => {
            this.node.active = false;
        });
    }

    private findDeep(name: string): Node | null {
        const stack = [this.node];
        while (stack.length) {
            const n = stack.pop()!;
            if (n.name === name) {
                return n;
            }
            for (const c of n.children) {
                stack.push(c);
            }
        }
        return null;
    }

    private wireByName(name: string, fn: () => void): void {
        const n = this.findDeep(name);
        n?.on("click", fn, this);
    }
}

@ccclass("InboxDetailView")
export class InboxDetailView extends InboxDetailPanel {}

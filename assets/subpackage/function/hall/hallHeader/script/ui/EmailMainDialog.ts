import { _decorator, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import type { MailItemDto } from "../config/LobbyTopViewProtocol";
import { InboxClaimCommand } from "../command/InboxClaimCommand";
import { InboxDeleteCommand } from "../command/InboxDeleteCommand";
import { InboxReadCommand } from "../command/InboxReadCommand";
import { LobbyTopViewModel } from "../model/LobbyTopViewModel";
import { renderMailList } from "../utility/InboxListScrollHelper";
import { InboxDetailPanel } from "./InboxDetailView";

const { ccclass } = _decorator;

@ccclass("EmailMainDialog")
export class EmailMainDialog extends BaseDialog {
    private listRoot: Node | null = null;
    private template: Node | null = null;
    private detailPanel: InboxDetailPanel | null = null;

    protected OnInit(): void {
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("close", () => this.CloseSelf());
        this.wireByName("delete", () => GameApp.Interface.SendCommand(new InboxDeleteCommand("")));
        this.wireByName("collect", () => GameApp.Interface.SendCommand(new InboxClaimCommand("")));
        this.listRoot = this.findDeep("mail_list")?.getChildByName("content") ?? this.findDeep("content");
        this.template = this.findDeep("mail_moban") ?? this.findDeep("moban");
        const detailNode = this.findDeep("showEmailDetailView") ?? this.findDeep("InboxDetailView");
        if (detailNode) {
            this.detailPanel = detailNode.getComponent(InboxDetailPanel) ?? detailNode.addComponent(InboxDetailPanel);
        }
        GameApp.Interface.GetModel(LobbyTopViewModel)
            .inboxList.RegisterWithInitValue((list) => this.applyList(list), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    protected OnClose(): void {}

    private applyList(list: MailItemDto[]): void {
        if (!this.listRoot || !this.template) {
            return;
        }
        renderMailList(this.listRoot, this.template, list, (item) => this.onSelectMail(item));
        const empty = this.findDeep("no_mail");
        if (empty) {
            empty.active = list.length === 0;
        }
    }

    private onSelectMail(item: MailItemDto): void {
        GameApp.Interface.SendCommand(new InboxReadCommand(item.eid));
        this.detailPanel?.show(item);
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

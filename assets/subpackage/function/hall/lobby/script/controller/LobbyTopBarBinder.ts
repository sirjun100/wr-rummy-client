import { _decorator, Component, find, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { LobbyModel } from "../model/LobbyModel";
import { InboxUnreadChangedEvent } from "../../hallHeader/script/event/LobbyTopViewEvents";
import { LobbyTopViewModel } from "../../hallHeader/script/model/LobbyTopViewModel";
import { ensureLobbyTopViewRegistered } from "../../hallHeader/script/LobbyTopViewModule";

const { ccclass } = _decorator;

@ccclass("LobbyTopBarBinder")
export class LobbyTopBarBinder extends Component {
    private mailRed: Node | null = null;
    private boxRed: Node | null = null;

    protected onLoad(): void {
        ensureLobbyTopViewRegistered();
        this.mailRed = this.findNode("emailRedNode") ?? find("email_red", this.node) ?? find("btn_mail/red", this.node);
        this.boxRed = find("btn_box/redpot", this.node) ?? find("btn_box/red", this.node);

        GameApp.Interface.GetModel(LobbyModel)
            .home.RegisterWithInitValue((home) => {
                this.applyMailRed(home.un_read_email ?? 0);
                this.applyPromoRed(home.promotions_red ?? 0);
            }, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);

        GameApp.Interface.GetModel(LobbyTopViewModel)
            .unreadCount.RegisterWithInitValue((n) => this.applyMailRed(n), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);

        GameApp.Interface.RegisterEvent(InboxUnreadChangedEvent, (e) => this.applyMailRed(e.count), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
    }

    protected start(): void {
        this.wireTopButtons();
    }

    private wireTopButtons(): void {
        const bind = (name: string, fn: () => void) => {
            const n = find(name, this.node) ?? find(`Canvas/${name}`, this.node);
            n?.on(Node.EventType.TOUCH_END, fn, this);
        };
        bind("btn_mail", () => void globalThis.wrLobby?.openEmailMain?.());
        bind("btn_box", () => void globalThis.wrLobby?.openActivityCenter?.());
        bind("btn_tabact", () => void globalThis.wrLobby?.openActivityCenter?.());
        bind("act_topgift", () => void globalThis.wrLobby?.openActivityCenter?.());
    }

    private applyMailRed(count: number): void {
        if (!this.mailRed) {
            return;
        }
        this.mailRed.active = count > 0;
        const lab = this.mailRed.getComponent(Label) ?? this.mailRed.getChildByName("Label")?.getComponent(Label);
        if (lab) {
            lab.string = count > 99 ? "99+" : String(count);
        }
    }

    private applyPromoRed(red: number): void {
        if (this.boxRed) {
            this.boxRed.active = red === 1;
        }
    }

    private findNode(name: string): Node | null {
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
}

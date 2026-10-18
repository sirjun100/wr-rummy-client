import { _decorator, instantiate, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { ensureLobbyRegistered } from "../../lobby/script/LobbyModule";
import { LobbyModel } from "../../lobby/script/model/LobbyModel";
import { UpdateActCollectOpenEvent } from "../../lobby/script/event/LobbyEvents";
import { bindActivityItem } from "../utility/ActivityCenterItemBinder";

const { ccclass } = _decorator;

@ccclass("ActivityCenterDialog")
export class ActivityCenterDialog extends BaseDialog {
    private listRoot: Node | null = null;
    private template: Node | null = null;

    protected OnInit(): void {
        ensureLobbyRegistered();
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("close", () => this.CloseSelf());
        this.listRoot = this.findDeep("actAnimListViewNew") ?? this.findDeep("list") ?? this.findDeep("content");
        this.template = this.findDeep("mobanNew") ?? this.findDeep("moban");
        const model = GameApp.Interface.GetModel(LobbyModel);
        model.home.RegisterWithInitValue((home) => this.applyActs(home), this).UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(UpdateActCollectOpenEvent, (e) => this.applyActs(e.home), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        this.applyActs(model.home.value);
    }

    protected OnClose(): void {}

    private applyActs(home: import("../../lobby/script/config/LobbyProtocol").HallHomeDto): void {
        const list = home.act_collect_open?.list ?? [];
        if (!this.listRoot || !this.template) {
            return;
        }
        this.template.active = false;
        for (const c of [...this.listRoot.children]) {
            if (c !== this.template) {
                c.destroy();
            }
        }
        for (const item of list) {
            const node = instantiate(this.template);
            node.active = true;
            node.parent = this.listRoot;
            bindActivityItem(node, item, (actId) => {
                void globalThis.wrLobby?.openByActId?.(actId);
            });
        }
        const tab = home.act_collect_open?.tab_act;
        if (tab?.act_id) {
            const tabNode = this.findDeep("tab_act") ?? this.findDeep("btn_tabact");
            if (tabNode) {
                bindActivityItem(tabNode, tab, (actId) => void globalThis.wrLobby?.openByActId?.(actId));
            }
        }
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

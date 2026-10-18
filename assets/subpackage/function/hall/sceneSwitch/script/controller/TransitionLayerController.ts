import { _decorator, find, Node, size, UITransform, view } from "cc";
import { BaseController } from "../../../../../script/game/controller/engine/BaseController";
import { TransitionMode } from "../config/TransitionConfig";

const { ccclass, property } = _decorator;

@ccclass("TransitionLayerController")
export class TransitionLayerController extends BaseController {
    @property(Node)
    public hall_bg: Node | null = null;

    @property(Node)
    public room_bg: Node | null = null;

    @property(Node)
    public login_bg: Node | null = null;

    protected onLoad(): void {
        this.resolveNodes();
        this.fitRootSizes();
    }

    public applyMode(mode: TransitionMode): void {
        this.resolveNodes();
        const showRoom = mode === TransitionMode.ToSubGame;
        const showHall = mode === TransitionMode.ToLobby;
        const showLogin = mode === TransitionMode.ToLogin;
        if (this.room_bg) {
            this.room_bg.active = showRoom;
        }
        if (this.hall_bg) {
            this.hall_bg.active = showHall;
        }
        if (this.login_bg) {
            this.login_bg.active = showLogin;
        }
    }

    public resolveNodes(): void {
        if (!this.hall_bg) {
            this.hall_bg = find("hall_bg", this.node) ?? find("Canvas/hall_bg");
        }
        if (!this.room_bg) {
            this.room_bg = find("room_bg", this.node) ?? find("Canvas/room_bg");
        }
        if (!this.login_bg) {
            this.login_bg = find("login_bg", this.node) ?? find("Canvas/login_bg");
        }
    }

    private fitRootSizes(): void {
        const visible = view.getVisibleSize();
        let w = Math.max(visible.width, 720);
        let h = Math.max(visible.height, 1280);
        for (const root of [this.hall_bg, this.room_bg, this.login_bg]) {
            if (!root?.isValid) {
                continue;
            }
            const tr = root.getComponent(UITransform);
            if (tr) {
                tr.setContentSize(size(w, h));
            }
        }
        const desk = this.room_bg?.getChildByName("desk");
        const deskTr = desk?.getComponent(UITransform);
        if (deskTr) {
            deskTr.setContentSize(size(w, h));
        }
    }
}

import { _decorator, Component, find, Node, Sprite, SpriteFrame } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { ApplyRoomBgCommand } from "../command/ApplyRoomBgCommand";
import type { DeskRoomContext, DeskSkinTargets } from "../config/DeskConfig";
import { DeskStyleChangedEvent } from "../event/DeskStyleChangedEvent";
import { PreChangeMatchRoomBgEvent } from "../event/PreChangeMatchRoomBgEvent";
import { ensureDeskRegistered } from "../DeskModule";

const { ccclass, property } = _decorator;

@ccclass("RoomBgBinder")
export class RoomBgBinder extends Component {
    @property(Node)
    public roomBg: Node | null = null;

    @property(Node)
    public desk: Node | null = null;

    @property([SpriteFrame])
    public tableBg: SpriteFrame[] = [];

    @property([SpriteFrame])
    public deskBg: SpriteFrame[] = [];

    @property([SpriteFrame])
    public fourDeskBgs: SpriteFrame[] = [];

    @property([SpriteFrame])
    public otherTableBg: SpriteFrame[] = [];

    @property([SpriteFrame])
    public otherDeskBg: SpriteFrame[] = [];

    public roomContext: DeskRoomContext = { scene: "hall" };

    protected onLoad(): void {
        this.resolveNodesIfNeeded();
    }

    protected onEnable(): void {
        ensureDeskRegistered();
        GameApp.Interface.RegisterEvent(DeskStyleChangedEvent, () => this.apply(), this)
            .UnRegisterWhenDisabled(this.node);
        GameApp.Interface.RegisterEvent(PreChangeMatchRoomBgEvent, () => this.applyMatchPreview(), this)
            .UnRegisterWhenDisabled(this.node);
        this.apply();
    }

    public resolveNodesIfNeeded(): void {
        if (!this.roomBg) {
            this.roomBg = find("room_bg", this.node) ?? find("Canvas/room_bg");
        }
        if (!this.desk && this.roomBg) {
            this.desk = this.roomBg.getChildByName("desk");
        }
        if (this.tableBg.length === 0 && this.roomBg) {
            const sp = this.roomBg.getComponent(Sprite);
            if (sp?.spriteFrame) {
                this.tableBg = [sp.spriteFrame];
            }
        }
        if (this.deskBg.length === 0 && this.desk) {
            const sp = this.desk.getComponent(Sprite);
            if (sp?.spriteFrame) {
                this.deskBg = [sp.spriteFrame];
            }
        }
    }

    public toTargets(): DeskSkinTargets | null {
        this.resolveNodesIfNeeded();
        if (!this.roomBg) {
            return null;
        }
        return {
            roomBg: this.roomBg,
            desk: this.desk,
            tableBg: this.tableBg,
            deskBg: this.deskBg,
            fourDeskBgs: this.fourDeskBgs,
            otherTableBg: this.otherTableBg,
            otherDeskBg: this.otherDeskBg,
            context: this.roomContext,
        };
    }

    public apply(): void {
        GameApp.Interface.SendCommand(new ApplyRoomBgCommand({ binder: this }));
    }

    public applyMatchPreview(): void {
        GameApp.Interface.SendCommand(new ApplyRoomBgCommand({ binder: this, matchPreview: true }));
    }
}

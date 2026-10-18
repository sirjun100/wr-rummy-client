import { _decorator, Component, find, Node, Sprite, SpriteFrame } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { ApplyRoomBgCommand } from "../../../../function/tableChrome/tableTheme/script/command/ApplyRoomBgCommand";
import { ensureDeskRegistered } from "../../../../function/tableChrome/tableTheme/script/DeskModule";
import { DeskStyleChangedEvent } from "../../../../function/tableChrome/tableTheme/script/event/DeskStyleChangedEvent";
import { PreChangeMatchRoomBgEvent } from "../../../../function/tableChrome/tableTheme/script/event/PreChangeMatchRoomBgEvent";
import { RummyModel } from "../model/RummyModel";

const { ccclass, property } = _decorator;

@ccclass("RummyRoomBgBinder")
export class RummyRoomBgBinder extends Component {
    @property(Node)
    public roomBgNode: Node | null = null;

    @property(Node)
    public deskNode: Node | null = null;

    @property([SpriteFrame])
    public tableBg: SpriteFrame[] = [];

    @property([SpriteFrame])
    public deskBg: SpriteFrame[] = [];

    @property([SpriteFrame])
    public fourDeskBgs: SpriteFrame[] = [];

    protected onLoad(): void {
        if (!this.roomBgNode) {
            this.roomBgNode = find("room_bg", this.node) ?? find("Canvas/room_bg");
        }
        if (!this.deskNode && this.roomBgNode) {
            this.deskNode = this.roomBgNode.getChildByName("desk");
        }
        if (this.tableBg.length === 0 && this.roomBgNode) {
            const sp = this.roomBgNode.getComponent(Sprite);
            if (sp?.spriteFrame) {
                this.tableBg = [sp.spriteFrame];
            }
        }
        if (this.deskBg.length === 0 && this.deskNode) {
            const sp = this.deskNode.getComponent(Sprite);
            if (sp?.spriteFrame) {
                this.deskBg = [sp.spriteFrame];
            }
        }
    }

    protected onEnable(): void {
        ensureDeskRegistered();
        GameApp.Interface.RegisterEvent(DeskStyleChangedEvent, () => this.apply(), this)
            .UnRegisterWhenDisabled(this.node);
        GameApp.Interface.RegisterEvent(PreChangeMatchRoomBgEvent, () => this.applyMatchPreview(), this)
            .UnRegisterWhenDisabled(this.node);
        this.apply();
    }

    private apply(): void {
        if (!this.roomBgNode?.isValid) {
            return;
        }
        const model = GameApp.Interface.GetModel(RummyModel);
        const isMatch = (model.templateId ?? "").includes("match");
        GameApp.Interface.SendCommand(
            new ApplyRoomBgCommand({
                targets: {
                    roomBg: this.roomBgNode,
                    desk: this.deskNode,
                    tableBg: this.tableBg,
                    deskBg: this.deskBg,
                    fourDeskBgs: this.fourDeskBgs,
                    otherTableBg: [],
                    otherDeskBg: [],
                    context: {
                        scene: "rummy",
                        specialMode: false,
                        isMatchRoom: isMatch,
                    },
                },
            }),
        );
    }

    private applyMatchPreview(): void {
        if (!this.roomBgNode?.isValid) {
            return;
        }
        GameApp.Interface.SendCommand(
            new ApplyRoomBgCommand({
                targets: {
                    roomBg: this.roomBgNode,
                    desk: this.deskNode,
                    tableBg: this.tableBg,
                    deskBg: this.deskBg,
                    fourDeskBgs: this.fourDeskBgs,
                    otherTableBg: [],
                    otherDeskBg: [],
                    context: { scene: "rummy" },
                },
                matchPreview: true,
            }),
        );
    }
}

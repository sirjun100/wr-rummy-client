import { _decorator, Label, Node, Sprite, SpriteFrame, v3 } from "cc";
import { FastBuyDialogBase } from "./FastBuyDialogBase";

const { ccclass, property } = _decorator;

@ccclass("HallFastBuyDialog")
export class HallFastBuyDialog extends FastBuyDialogBase {
    @property(Node)
    public rootNodeRef: Node | null = null;

    @property([SpriteFrame])
    public icon_imgs: SpriteFrame[] = [];

    @property([SpriteFrame])
    public tab_imgs: SpriteFrame[] = [];

    protected OnInit(uiData?: import("../../../../../script/game/commerce/config/PaymentProtocol").FastBuyOpenData): void {
        if (this.rootNodeRef) {
            this.rootNode = this.rootNodeRef;
        }
        this.iconImgs = this.icon_imgs;
        this.tabImgs = this.tab_imgs;
        super.OnInit(uiData ?? null);
    }

    protected styleTabSelected(tab: Node, selected: boolean): void {
        const ico = tab.getChildByName("ico");
        const price = tab.getChildByName("price");
        if (ico && this.tabImgs.length > 1) {
            const sp = ico.getComponent(Sprite);
            if (sp) {
                sp.spriteFrame = selected ? this.tabImgs[1] : this.tabImgs[0];
            }
        }
        if (price) {
            const lb = price.getComponent(Label);
            if (lb) {
                lb.fontSize = selected ? 84 : 76;
                lb.lineHeight = selected ? 88 : 80;
                price.setPosition(v3(0, selected ? -4 : -11, 0));
            }
        }
    }
}

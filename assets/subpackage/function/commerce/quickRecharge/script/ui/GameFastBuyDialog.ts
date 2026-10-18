import { _decorator, Label, Node, Sprite, SpriteFrame, v3 } from "cc";
import { FastBuyDialogBase } from "./FastBuyDialogBase";

const { ccclass, property } = _decorator;

@ccclass("GameFastBuyDialog")
export class GameFastBuyDialog extends FastBuyDialogBase {
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
            ico.setScale(v3(selected ? 1 : 0.9, selected ? 1 : 0.9, 1));
            ico.setPosition(v3(selected ? 8 : 0, selected ? -64.794 : -65.176, 0));
        }
        if (price) {
            const lb = price.getComponent(Label);
            if (lb) {
                lb.fontSize = selected ? 68 : 64;
                lb.lineHeight = selected ? 70 : 68;
                price.setPosition(v3(0, selected ? 9 : 3, 0));
            }
        }
    }
}

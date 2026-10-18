import { _decorator, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { StartShopPurchaseCommand } from "../../../../../script/game/commerce/command/StartShopPurchaseCommand";
import { PaymentModel } from "../../../../../script/game/commerce/model/PaymentModel";
import { PaymentDialogBase } from "./PaymentDialogBase";

const { ccclass } = _decorator;

export type PaymentSelectData = {
    skuId: number;
    channelId: number;
    scene: number;
    vid: number;
    fastBuy: boolean;
};

@ccclass("PaymentSelect")
export class PaymentSelectDialog extends PaymentDialogBase {
    private data: PaymentSelectData = { skuId: 0, channelId: 1, scene: 1, vid: 0, fastBuy: false };

    protected OnInit(uiData: PaymentSelectData = null): void {
        if (uiData) {
            this.data = uiData;
        }
        const channels = GameApp.Interface.GetModel(PaymentModel).shopPage.value.channels ?? [];
        channels.forEach((ch, i) => {
            const stack: Node[] = [this.node];
            while (stack.length) {
                const n = stack.pop()!;
                if (n.name === `channel_${i}` || n.name === `pay_channel_${ch.id}`) {
                    n.getChildByName("name")?.getComponent(Label)?.string = ch.name ?? "";
                    n.off(Node.EventType.TOUCH_END);
                    n.on(Node.EventType.TOUCH_END, () => {
                        this.data.channelId = ch.id ?? 1;
                    }, this);
                }
                for (const c of n.children) {
                    stack.push(c);
                }
            }
        });
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("confirm_btn", () => {
            GameApp.Interface.SendCommand(
                new StartShopPurchaseCommand(this.data.skuId, this.data.channelId, this.data.scene, this.data.vid, this.data.fastBuy),
            );
            this.CloseSelf();
        });
    }

    protected OnClose(): void {}
}

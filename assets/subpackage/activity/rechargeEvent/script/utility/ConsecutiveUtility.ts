import { Label, Node } from "cc";
import { IUtility } from "../../../../../script/framework/QFramework";
import { ConsecutiveGiftPageDto } from "../config/RechargeEventConfig";

export class ConsecutiveUtility implements IUtility {
    public applyPage(content: Node | null, extraLabel: Label | null, page: ConsecutiveGiftPageDto): void {
        if (extraLabel && page.extra) {
            extraLabel.string = page.extra;
        }
        if (!content || !page.good_list) {
            return;
        }
        for (let i = 0; i < 7; i++) {
            const dayItem = content.getChildByName(`dayItem${i}`);
            const g = page.good_list[i];
            if (!dayItem || !g) {
                continue;
            }
            dayItem.active = true;
            dayItem.getChildByName("day")?.getComponent(Label)?.string = `DAY ${g.day ?? i + 1}`;
            const price = dayItem.getChildByName("btn_addcash")?.getChildByName("price")?.getComponent(Label);
            if (price) {
                price.string = `₹${g.price ?? 0}`;
            }
            const lock = dayItem.getChildByName("btn_addcash")?.getChildByName("lock");
            const add = dayItem.getChildByName("btn_addcash");
            const purchased = dayItem.getChildByName("btn_purchased");
            const state = Number(g.state ?? 0);
            if (add) {
                add.active = state === 1 || state === 2;
            }
            if (purchased) {
                purchased.active = state === 3;
            }
            if (lock) {
                lock.active = state === 2;
            }
        }
    }
}

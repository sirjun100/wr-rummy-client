import { Label, Node } from "cc";
import { IUtility } from "../../../../../script/framework/QFramework";
import { RebateRechargePageDto } from "../config/RechargeEventConfig";

export class RebateUtility implements IUtility {
    public applyPage(root: Node | null, flagLabel: Label | null, page: RebateRechargePageDto): void {
        if (flagLabel && page.max) {
            flagLabel.string = `UP TO ₹${page.max}`;
        }
        const content = root?.getChildByName("content");
        if (!content || !page.good_list) {
            return;
        }
        for (let i = 0; i < 3; i++) {
            const item = content.getChildByName(`item${i}`);
            const g = page.good_list[i];
            if (!item || !g) {
                continue;
            }
            item.getChildByName("price")?.getComponent(Label)?.string = `₹${g.price ?? 0}`;
            item.getChildByName("cash")?.getComponent(Label)?.string = `₹${g.cash ?? 0}`;
            item.getChildByName("bonus")?.getComponent(Label)?.string = `₹${g.bonus ?? 0}`;
        }
    }
}

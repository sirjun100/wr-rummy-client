import { Label, Node, v3 } from "cc";
import { IUtility } from "../../../../../script/framework/QFramework";
import { FirstRechargePageDto } from "../config/RechargeEventConfig";

export class FirstBuyUtility implements IUtility {
    public applyRoomLayout(root: Node | null, inRoom: boolean): void {
        if (!inRoom || !root) {
            return;
        }
        root.setPosition(v3(0, 10, 0));
        root.setScale(v3(0.72, 0.72, 1));
        const close = root.getChildByName("btn_close");
        close?.setPosition(v3(345.594, 423.492, 0));
    }

    public applyPage(root: Node | null, page: FirstRechargePageDto): void {
        if (!root || !page.good_list) {
            return;
        }
        const flag = root.parent?.getChildByName("flagLabel")?.getComponent(Label);
        if (flag && page.sub_title) {
            flag.string = page.sub_title;
        }
        for (let i = 0; i < 4; i++) {
            const item = root.getChildByName(`item${i}`);
            const good = page.good_list[i];
            if (!item || !good) {
                continue;
            }
            item.getChildByName("cash")?.getComponent(Label)?.string = `₹${good.cash ?? 0}`;
            item.getChildByName("bonus")?.getComponent(Label)?.string = `₹${good.bonus ?? 0}`;
            item.getChildByName("pay_btn")?.getChildByName("wz")?.getComponent(Label)?.string =
                `₹${good.price ?? 0}`;
            item.getChildByName("percent")?.getComponent(Label)?.string = `+${good.ratio ?? ""}`;
        }
    }

    public resolvePrefabName(page: FirstRechargePageDto | null, inRoom: boolean): string {
        if (Number(page?.first_recharge_type) === 1) {
            return "FirstBuyOldDialog";
        }
        return inRoom ? "FirstBuyGameDialog" : "FirstBuyDialog";
    }
}

import { Node } from "cc";
import type { ShopSkuDto } from "../../../../../script/game/commerce/config/PaymentProtocol";
import { setLabel } from "../utility/PurseNodeUtil";
import { PaymentUtility } from "../../../../../script/game/commerce/utility/PaymentUtility";

export type SkuSelectHandler = (skuId: number) => void;

export function bindShopSkuGrid(
    root: Node,
    list: ShopSkuDto[],
    selectedId: number,
    onSelect: SkuSelectHandler,
    target: object,
): void {
    const util = new PaymentUtility();
    for (let i = 0; i < 8; i++) {
        const item = list[i];
        const itemNode = root.getChildByName(`good_item_${i}`) ?? root.getChildByName(`item${i}`);
        if (!itemNode) {
            continue;
        }
        if (!item) {
            itemNode.active = false;
            continue;
        }
        itemNode.active = true;
        setLabel(itemNode, `good_price_${i}`, util.formatMoney(item.money));
        setLabel(root, `good_price_${i}`, util.formatMoney(item.money));
        setLabel(root, `good_rate_${i}`, item.rate ? `+${item.rate}%` : "");
        const sel = (item.id ?? 0) === selectedId;
        const selNode = itemNode.getChildByName("select") ?? itemNode.getChildByName("Sprite");
        if (selNode) {
            selNode.active = sel;
        }
        itemNode.off(Node.EventType.TOUCH_END);
        itemNode.on(Node.EventType.TOUCH_END, () => onSelect(item.id ?? 0), target);
    }
}

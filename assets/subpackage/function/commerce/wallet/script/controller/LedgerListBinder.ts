import { Label, Node } from "cc";
import type { LedgerEntryDto } from "../../../../../script/game/commerce/config/PaymentProtocol";
import { PaymentUtility } from "../../../../../script/game/commerce/utility/PaymentUtility";

export function bindLedgerRows(
    scrollRoot: Node,
    mobanName: string,
    list: LedgerEntryDto[],
    maxRows: number,
    onRowClick: (id: number) => void,
    target: object,
): void {
    const moban = scrollRoot.getChildByName(mobanName) ?? scrollRoot.getChildByName("recordMoban");
    if (!moban) {
        return;
    }
    const util = new PaymentUtility();
    const count = Math.min(list.length, maxRows);
    for (let i = 0; i < count; i++) {
        const row = list[i];
        const item = i === 0 ? moban : moban.clone();
        if (i > 0) {
            moban.parent?.addChild(item);
        }
        item.getChildByName("title")?.getComponent(Label)?.string = row.title ?? row.type ?? "";
        item.getChildByName("amount")?.getComponent(Label)?.string = util.formatMoney(row.amount);
        item.off(Node.EventType.TOUCH_END);
        item.on(
            Node.EventType.TOUCH_END,
            () => {
                if (row.id) {
                    onRowClick(row.id);
                }
            },
            target,
        );
    }
}

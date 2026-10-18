import { Label, Node } from "cc";
import type { WithdrawOrderDto, WithdrawPageDto } from "../../../../../script/game/commerce/config/PaymentProtocol";
import { PaymentUtility } from "../../../../../script/game/commerce/utility/PaymentUtility";
import { setLabel } from "../utility/PurseNodeUtil";

export function applyWithdrawPage(root: Node, page: WithdrawPageDto, balanceLabel?: Label): void {
    const util = new PaymentUtility();
    const text = util.formatMoney(page.withdrawable);
    if (balanceLabel) {
        balanceLabel.string = text;
    }
    setLabel(root, "balance_amt", text);
    setLabel(root, "min_tip", `Min ${util.formatMoney(page.min_amount)}`);
    setLabel(root, "daily_left", `Left today: ${page.daily_left ?? 0}`);
}

export function bindWithdrawRecords(
    scrollRoot: Node,
    mobanName: string,
    list: WithdrawOrderDto[],
    target: object,
): void {
    const moban = scrollRoot.getChildByName(mobanName) ?? scrollRoot.getChildByName("recordMoban");
    if (!moban) {
        return;
    }
    const util = new PaymentUtility();
    list.slice(0, 12).forEach((row, i) => {
        const item = i === 0 ? moban : moban.clone();
        if (i > 0) {
            moban.parent?.addChild(item);
        }
        item.getChildByName("amount")?.getComponent(Label)?.string = util.formatMoney(row.amount);
        item.getChildByName("status")?.getComponent(Label)?.string = row.status ?? "";
    });
}

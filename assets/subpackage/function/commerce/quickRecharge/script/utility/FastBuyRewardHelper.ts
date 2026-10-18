import { PaymentUtility } from "../../../../../script/game/commerce/utility/PaymentUtility";

const util = new PaymentUtility();

export function formatFastBuyMoney(amount: number | undefined): string {
    return util.formatMoney(amount);
}

/** Legacy reward icon index: type 7 maps to slot 2. */
export function mapRewardIconIndex(rewardType: number | undefined): number {
    if (rewardType === undefined) {
        return 0;
    }
    let t = Math.floor(rewardType);
    if (t === 7) {
        t = 2;
    }
    return Math.max(0, t);
}

export function rewardAmountText(reward: { amt?: string; num?: number }): string {
    if (reward.num !== undefined && reward.num !== null) {
        return String(reward.num);
    }
    if (reward.amt !== undefined && reward.amt !== null) {
        return String(reward.amt);
    }
    return "";
}

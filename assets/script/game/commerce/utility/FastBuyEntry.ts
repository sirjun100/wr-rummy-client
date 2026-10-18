import type { FastBuyFlowParams } from "../../../../subpackage/function/commerce/quickRecharge/script/FastBuyModule";

/** Legacy `Utils.showQuickRecharge` entry — lazy-loads fast_buy bundle. */
export function showQuickRecharge(params: FastBuyFlowParams): void {
    void import("../../../../subpackage/function/commerce/quickRecharge/script/FastBuyModule").then((m) => {
        m.openFastBuyFlow({
            context: params.inRoom ? "game" : "hall",
            vid: params.vid ?? 0,
            inRoom: params.inRoom ?? 0,
            checkKyc: params.checkKyc,
            minEntry: params.minEntry,
            tidKey: params.tidKey,
            autoQuick: params.autoQuick,
        });
    });
}

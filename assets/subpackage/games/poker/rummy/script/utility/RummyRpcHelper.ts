import { RummyRes } from "../config/RummyProtocol";

export function applyRummyRpcSideEffects(res: RummyRes): void {
    if (res.pop_addgold != null && res.pop_addgold > 0) {
        globalThis.wrUi?.showRecharge?.();
    }
    if (res.err_msg) {
        globalThis.wrUi?.showToast?.(res.err_msg);
    }
}

export function isRummyOk(res: RummyRes): boolean {
    return (res.code ?? 0) === 0 && (res.ret == null || res.ret === 0);
}

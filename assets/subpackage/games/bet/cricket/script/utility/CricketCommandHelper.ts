import { LogKit } from "../../../../../../script/framework/toolkits/coreKit/logKit/LogKit";

export function logCricketCommandError(tag: string, err: unknown): void {
    LogKit.W("[Cricket] {0} {1}", tag, err instanceof Error ? err.message : String(err));
}

/** Legacy Act_131 insufficient balance (maps to Due invalid argument in P0). */
export const CRICKET_RET_MONEY_LESS = 408500;

export function isCricketMoneyLessError(err: unknown): boolean {
    const msg = err instanceof Error ? err.message : String(err);
    return msg.includes("408500") || msg.includes("code=3");
}

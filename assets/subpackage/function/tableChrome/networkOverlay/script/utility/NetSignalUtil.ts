import { sys } from "cc";

export function pickSignalFrameIndex(pingMs: number, networkType: number, isWifi: boolean): number {
    const e = Math.min(999, Math.max(0, pingMs));
    if (networkType === 0) {
        return 4;
    }
    if (isWifi || networkType === 1) {
        if (e <= 250) {
            return 0;
        }
        if (e <= 400) {
            return 1;
        }
        if (e <= 700) {
            return 2;
        }
        return 2;
    }
    if (e <= 250) {
        return 0;
    }
    if (e <= 400) {
        return 1;
    }
    if (e <= 500) {
        return 2;
    }
    if (e <= 700) {
        return 2;
    }
    return 3;
}

export function currentNetworkType(): number {
    return sys.getNetworkType();
}

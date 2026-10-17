import { Node, tween, Tween, Vec3 } from "cc";
import { UiAnimUtil } from "./UiAnimUtil";

export type UtilityTweenHandle = {
    stop(): void;
};

// #region node

function isValid(obj: unknown): boolean {
    if (obj == null) {
        return false;
    }
    const node = obj as Node;
    return typeof node.isValid === "function" ? node.isValid : true;
}

// #endregion

// #region format

function formatTemplate(template: string, ...replacements: (string | number)[]): string {
    let result = template;
    if (result.indexOf("${0}") === -1) {
        for (const value of replacements) {
            result = result.replace("$", String(value));
        }
        return result;
    }
    for (let i = 0; i < replacements.length; i++) {
        result = result.replace(`\${${i}}`, String(replacements[i]));
    }
    return result;
}

function parseNumDouble(raw: string, decimals = 2): number {
    const n = Number(raw);
    if (Number.isNaN(n)) {
        return 0;
    }
    const parts = raw.split(".");
    let intPart = parts[0] ?? "0";
    let frac = "";
    if (parts[1]) {
        frac = parts[1].substring(0, 2);
        if (decimals === 2 && frac.length === 1) {
            frac += "0";
        }
    }
    return Number(`${intPart}.${frac || "0"}`);
}

function formatMoney(amount: number | string, opts?: { decimals?: number }): string {
    const decimals = opts?.decimals ?? 2;
    let n = Number(amount);
    if (Number.isNaN(n)) {
        return String(amount);
    }
    const fixed = Number(n.toFixed(5));
    const sign = fixed < 0 ? -1 : 1;
    const abs = Math.abs(fixed);

    if (abs >= 10_000_000) {
        const cr = (abs / 10_000_000).toFixed(2);
        return sign < 0 ? `-${cr}Cr` : `${cr}Cr`;
    }
    if (abs >= 100_000) {
        const inner = formatMoney(abs / 100_000, { decimals: 2 });
        return sign < 0 ? `-${inner}L` : `${inner}L`;
    }

    const parsed = parseNumDouble(String(abs), decimals === -1 ? 2 : decimals);
    if (sign < 0) {
        if (decimals === 2) {
            return `-${parsed.toFixed(2)}`;
        }
        if (decimals === 1) {
            return `-${parsed.toFixed(1)}`;
        }
        if (decimals === -1) {
            const s = parsed.toString();
            return s.indexOf(".") !== -1 ? `-${parsed.toFixed(2)}` : `-${s}`;
        }
        return `-${parsed.toString()}`;
    }
    if (decimals === 2) {
        return parsed.toFixed(2);
    }
    if (decimals === 1) {
        return parsed.toFixed(1);
    }
    if (decimals === -1) {
        const s = parsed.toString();
        return s.indexOf(".") !== -1 ? parsed.toFixed(2) : s;
    }
    return parsed.toString();
}

function chipCompact(amount: number | string): string {
    return formatMoney(amount, { decimals: -1 });
}

// #endregion

// #region time

function safePositiveSeconds(value: number): number {
    if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
        return 0;
    }
    return value;
}

/** Aligns with legacy Utils.parseCountDownToSec; <=0 → "0m 0s". */
function durationShort(totalSeconds: number): string {
    const sec = safePositiveSeconds(totalSeconds);
    if (sec <= 0) {
        return "0m 0s";
    }
    let t = Math.floor(sec);
    let out = "";
    if (t >= 3600) {
        const h = Math.floor(t / 3600);
        out += `${h}h`;
        t -= 3600 * h;
    }
    if (t >= 60) {
        if (out.length > 0) {
            out += " ";
        }
        const m = Math.floor(t / 60);
        out += `${m}m`;
        t = Math.floor(t - 60 * m);
    }
    if (t >= 0) {
        if (out.length > 0) {
            out += " ";
        }
        out += t < 10 && out.length > 0 ? `0${t}s` : `${t}s`;
    }
    return out;
}

// #endregion

// #region tween

function stopTweenHandle(handle: UtilityTweenHandle | null | undefined): void {
    handle?.stop();
}

function stopAllOnNode(node: Node): void {
    if (!isValid(node)) {
        return;
    }
    Tween.stopAllByTarget(node);
}

function delay(node: Node, seconds: number, fn: () => void): UtilityTweenHandle {
    if (!isValid(node)) {
        return { stop: () => {} };
    }
    const tw = tween(node)
        .delay(seconds)
        .call(() => {
            if (isValid(node)) {
                fn();
            }
        })
        .start();
    return {
        stop: () => {
            tw.stop();
        },
    };
}

function scheduleRepeating(node: Node, intervalSec: number, fn: () => void): UtilityTweenHandle {
    if (!isValid(node)) {
        return { stop: () => {} };
    }
    const tw = tween(node)
        .delay(intervalSec)
        .call(() => {
            if (isValid(node)) {
                fn();
            }
        })
        .union()
        .repeatForever()
        .start();
    return {
        stop: () => {
            tw.stop();
        },
    };
}

function pulseScale(
    node: Node,
    opts?: { scale?: number; duration?: number; repeat?: number },
): void {
    if (!isValid(node)) {
        return;
    }
    const peak = opts?.scale ?? 1.1;
    const duration = opts?.duration ?? 0.2;
    const repeat = opts?.repeat ?? 2;
    stopAllOnNode(node);
    tween(node)
        .to(duration, { scale: new Vec3(peak, peak, 1) })
        .to(duration, { scale: new Vec3(1, 1, 1) })
        .union()
        .repeat(repeat)
        .start();
}

// #endregion

// #region ui

function stopNodeTween(node: Node): void {
    UiAnimUtil.stopNodeTween(node);
}

// #endregion

export const Utility = {
    node: {
        isValid,
    },
    format: {
        template: formatTemplate,
        money: formatMoney,
        chipCompact,
    },
    time: {
        durationShort,
    },
    tween: {
        delay,
        scheduleRepeating,
        stop: stopTweenHandle,
        stopAllOnNode,
        pulseScale,
    },
    ui: {
        stopNodeTween,
    },
} as const;

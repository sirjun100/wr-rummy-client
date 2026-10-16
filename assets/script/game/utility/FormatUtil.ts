import { ChipFormatUtil } from "./ChipFormatUtil";

/** 通用字符串 / 数字格式化。 */
export class FormatUtil {
    public static ToPercent(ratio: number): string {
        if (Number.isNaN(ratio)) {
            return "0%";
        }
        let text = (100 * ratio).toFixed(2);
        text = text.replace(/\.?0+$/, "");
        return `${text}%`;
    }

    public static Format(template: string, ...args: unknown[]): string {
        let index = 0;
        return template.replace(/%s/g, () => {
            const arg = args[index++];
            return arg === undefined || arg === null ? "" : String(arg);
        });
    }

    public static GetShortName(text: string | null, maxLen: number, keepSuffix: boolean = false): string {
        if (text == null || maxLen <= 0) {
            return "";
        }
        if (text.length < maxLen) {
            return text;
        }
        let out = text.substring(0, maxLen);
        if (!keepSuffix) {
            out += "..";
        }
        return out.length >= text.length ? text : out;
    }

    public static GetLimitLengthString(text: string | null, maxLen: number, keepSuffix: boolean = false): string {
        return FormatUtil.GetShortName(text, maxLen, keepSuffix);
    }

    public static ParseNumDouble(value: string, fractionDigits: number = 2): number {
        const num = Number(value);
        if (Number.isNaN(num)) {
            return 0;
        }
        const parts = value.split(".");
        let whole = "";
        let frac = "";
        if (parts.length > 0) {
            if (parts[0]) {
                whole = parts[0];
            }
            if (parts[1]) {
                frac = parts[1].substring(0, 2);
                if (fractionDigits === 2 && frac.length === 1) {
                    frac += "0";
                }
            }
        }
        return Number(`${whole}.${frac}`);
    }

    public static ParseDouble(
        value: number | string,
        fractionDigits: number = 2,
        clampNegativeToZero: boolean = false,
        lakhSpace: boolean = false,
    ): string | number {
        let num = Number(value);
        const digits = fractionDigits;
        if (Number.isNaN(num)) {
            return value;
        }
        const precise = Number(Number(value).toFixed(5));
        let signed = precise;
        num = Math.abs(precise);
        if (clampNegativeToZero && signed < 0) {
            signed = 0;
            num = 0;
        }
        const space = lakhSpace ? " " : "";
        if (num >= 10000000) {
            const cr = num / 10000000;
            return signed < 0 ? `-${cr.toFixed(2)}${space}Cr` : `${cr.toFixed(2)}${space}Cr`;
        }
        if (num >= 100000) {
            const lakh = num / 100000;
            return signed < 0
                ? `-${FormatUtil.ParseDouble(lakh.toString(), 2)}${space}L`
                : `${FormatUtil.ParseDouble(lakh.toString(), 2)}${space}L`;
        }
        const trimmed = FormatUtil.ParseNumDouble(num + "", digits);
        if (signed < 0) {
            if (digits === 2) {
                return `-${trimmed.toFixed(2)}`;
            }
            if (digits === 1) {
                return `-${trimmed.toFixed(1)}`;
            }
            return `-${trimmed.toString()}`;
        }
        if (digits === 2) {
            return trimmed.toFixed(2);
        }
        if (digits === 1) {
            return trimmed.toFixed(1);
        }
        return trimmed.toString();
    }

    public static ParseDouble2(value: number | string, fractionDigits: number = 2): string | number {
        let signed = Number(value);
        let abs = Number(value);
        const digits = fractionDigits === 1 ? 1 : 2;
        if (Number.isNaN(abs)) {
            return value;
        }
        abs = Math.abs(Number(value));
        if (abs >= 100000) {
            const lakh = abs / 100000;
            return signed < 0
                ? `-${FormatUtil.ParseDouble2(lakh.toString())}L`
                : `${FormatUtil.ParseDouble2(lakh.toString())}L`;
        }
        if (abs >= 10000) {
            const k = abs / 1000;
            return signed < 0
                ? `-${FormatUtil.ParseDouble2(k.toString())}K`
                : `${FormatUtil.ParseDouble2(k.toString())}K`;
        }
        const trimmed = FormatUtil.ParseNumDouble(abs + "", digits);
        return signed < 0 ? `-${trimmed.toString()}` : trimmed.toString();
    }
}

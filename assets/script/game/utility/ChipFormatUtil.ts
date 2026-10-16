/** 筹码 / 点赞数等展示格式（迁移自 ToolUtils.parse_ChipNum*）。 */
export class ChipFormatUtil {
    public static FormatChipWithCommas(value: number | string): string {
        const fixed = Number(value).toFixed(0);
        const num = Number(fixed);
        if (num >= 10000) {
            let digits = num.toString();
            let out = "";
            let group = 0;
            for (let i = digits.length - 1; i >= 0; i--) {
                out = digits[i] + out;
                group++;
                const at = digits.length - i;
                if ((group === 3 && i !== 0) || (group === 2 && i !== 0 && at > 3)) {
                    out = "," + out;
                    group = 0;
                }
            }
            return out;
        }
        return num.toString();
    }

    public static TruncateToTwoDecimalPlaces(value: number): string {
        if (typeof value !== "number" || Number.isNaN(value)) {
            return "0.00";
        }
        const [whole, frac = ""] = value.toString().split(".");
        return `${whole}.${frac.slice(0, 2).padEnd(2, "0")}`;
    }

    public static FormatChipLakhCrore(value: number | string, _unused?: unknown): string | number {
        const num = Number(value);
        if (Number.isNaN(num)) {
            return value;
        }
        const intPart = Math.floor(Number(value));
        const signed = Number(intPart);
        let abs = Math.abs(Number(intPart));
        if (abs >= 10000000) {
            const cr = abs / 10000000;
            return signed < 0
                ? `-${ChipFormatUtil.TruncateToTwoDecimalPlaces(cr)}Cr`
                : `${ChipFormatUtil.TruncateToTwoDecimalPlaces(cr)}Cr`;
        }
        if (abs >= 100000) {
            const lakh = abs / 100000;
            return signed < 0
                ? `-${ChipFormatUtil.TruncateToTwoDecimalPlaces(lakh)}L`
                : `${ChipFormatUtil.TruncateToTwoDecimalPlaces(lakh)}L`;
        }
        return signed < 0 ? `-${abs.toFixed(0)}` : abs.toFixed(0);
    }

    public static FormatChipLakhCroreFlexible(value: number | string, fractionDigits: number = 1): string | number {
        const num = Number(value);
        if (Number.isNaN(num)) {
            return value;
        }
        const fixed = Number(value).toFixed(0);
        const signed = Number(fixed);
        let abs = Math.abs(Number(fixed));
        if (abs >= 10000000) {
            const cr = abs / 10000000;
            const text = cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(fractionDigits);
            return signed < 0 ? `-${text}Cr` : `${text}Cr`;
        }
        if (abs >= 100000) {
            const lakh = abs / 100000;
            const text = lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(fractionDigits);
            return signed < 0 ? `-${text}L` : `${text}L`;
        }
        return signed < 0 ? `-${abs.toFixed(0)}` : abs.toFixed(0);
    }

    public static FormatLikeCount(value: number | string): string {
        const num = Number(value);
        if (Number.isNaN(num)) {
            return String(value);
        }
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    }

    /** @deprecated 迁移期别名 */
    public static parse_ChipNum = ChipFormatUtil.FormatChipWithCommas;
    public static parse_ChipNum2 = ChipFormatUtil.FormatChipLakhCrore;
    public static parse_ChipNum3 = ChipFormatUtil.FormatChipLakhCroreFlexible;
    public static parseDianzanNumber = ChipFormatUtil.FormatLikeCount;
}

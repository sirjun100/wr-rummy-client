export class StringValidateUtil {
    public static CheckUpiString(text: string): boolean {
        if (text.indexOf("@") === -1) {
            return false;
        }
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if ("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.@".indexOf(ch) === -1) {
                return false;
            }
        }
        return true;
    }

    public static CheckIsPureNumber(text: string): boolean {
        const pattern = /[\w]/;
        for (let i = 0; i < text.length; i++) {
            if (!pattern.test(text[i])) {
                return false;
            }
        }
        return true;
    }

    public static GetPureNumberString(text: string | number): string {
        return `${text}`.replace(/[\D]/g, "");
    }

    public static GetPureNumberStringWithDot(text: string | number): string {
        return `${text}`.replace(/[^\d.]/g, "");
    }

    public static IsSafeString(value: unknown): string {
        return typeof value === "string" ? value : "";
    }

    public static IsSafeNumber(value: unknown): number {
        return typeof value !== "number" || Number.isNaN(value) ? 0 : value;
    }
}

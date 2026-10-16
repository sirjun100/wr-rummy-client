import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";

export class JsonUtil {
    public static ToJsonString(data: unknown): string {
        try {
            return JSON.stringify(data);
        } catch (err) {
            LogKit.E("[JsonUtil] ToJsonString {0}", err instanceof Error ? err.message : String(err));
            return "";
        }
    }

    public static ParseJson<T = Record<string, unknown>>(text: string): T {
        try {
            return JSON.parse(text) as T;
        } catch (err) {
            LogKit.E("[JsonUtil] ParseJson {0}", err instanceof Error ? err.message : String(err));
            return {} as T;
        }
    }

    public static IsJsonString(text: string): boolean {
        try {
            const parsed = JSON.parse(text);
            return typeof parsed === "object" && parsed !== null;
        } catch {
            return false;
        }
    }

    public static GetPrintJsonStr(data: unknown): string {
        try {
            return JSON.stringify(data, null, 2);
        } catch {
            return String(data);
        }
    }

    public static Dump(data: unknown): void {
        LogKit.I("[JsonUtil] dump {0}", JsonUtil.GetPrintJsonStr(data));
    }

    public static parseJson = JsonUtil.ParseJson;
    public static toJsonString = JsonUtil.ToJsonString;
}

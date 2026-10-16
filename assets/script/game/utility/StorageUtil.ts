import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";

export class StorageUtil {
    public static SetItemAsync(key: string, value: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                localStorage.setItem(key, value);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    public static async SaveData(key: string, value: string): Promise<void> {
        try {
            await StorageUtil.SetItemAsync(key, value);
        } catch (err) {
            LogKit.E("[StorageUtil] SaveData {0}", err instanceof Error ? err.message : String(err));
        }
    }
}

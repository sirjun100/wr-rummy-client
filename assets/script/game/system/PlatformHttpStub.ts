// @ts-nocheck
/** HTTP 上报占位，待 NetworkSystem 接入旧 HttpManager API。 */
export default class HttpManager {
    private static _inst: HttpManager;

    static shared(): HttpManager {
        if (!HttpManager._inst) {
            HttpManager._inst = new HttpManager();
        }
        return HttpManager._inst;
    }

    doGetLoginAfterAddToken(_token: string, _cb: unknown): void {}

    doSdkApiReport(_payload: Record<string, unknown>): void {}

    doPhonePeReport(_payload: unknown): void {}

    doGetLoginAfterPush(): void {}

    getUrl(): string {
        return "";
    }
}

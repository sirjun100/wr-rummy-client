import { sys } from "cc";
import { BundleKey, getManifestEntry } from "../config/BundleManifest";

/** 远程 CDN 根路径；由运营配置注入后使用。 */
export type RemoteUrlList = Partial<Record<string, string>>;

let remoteUrlList: RemoteUrlList = {};

export class RemoteAssetUrlUtil {
    public static SetRemoteUrlList(list: RemoteUrlList): void {
        remoteUrlList = list ?? {};
    }

    private static appendPlatformPath(base: string, bundleFolderName: string): string {
        const isWeb = sys.platform === "MOBILE_BROWSER" || sys.platform === "DESKTOP_BROWSER";
        return isWeb ? `${base}web/${bundleFolderName}` : `${base}native/${bundleFolderName}`;
    }

    private static resolveHttpBase(key: string): string {
        const raw = remoteUrlList[key];
        if (!raw || raw.length === 0) {
            return "";
        }
        if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
            return "";
        }
        return raw;
    }

    public static GetRemoteSoundUrl(): string {
        const base = RemoteAssetUrlUtil.resolveHttpBase("audio");
        if (!base) {
            return "";
        }
        const entry = getManifestEntry(BundleKey.Sound);
        return entry ? RemoteAssetUrlUtil.appendPlatformPath(base, entry.bundleName) : "";
    }
}

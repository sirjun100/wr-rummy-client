import { sys } from "cc";
import { DESIGN_SCREEN_WIDTH } from "../config/ScreenConfig";

export class PlatformUtil {
    public static IsAndroidPlatform(): boolean {
        if (!sys.isNative) {
            return false;
        }
        return sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS;
    }

    public static IsIosPlatform(): boolean {
        return sys.isNative && sys.os === sys.OS.IOS;
    }

    public static IsPadPlatform(): boolean {
        return Math.abs(DESIGN_SCREEN_WIDTH - 720) >= 5;
    }

    /** 旧工程：部分功能在 iOS / macOS 上禁用。 */
    public static IsForbidFuc(): boolean {
        return sys.os === sys.OS.IOS || sys.os === sys.OS.OSX;
    }
}

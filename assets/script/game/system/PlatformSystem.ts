// @ts-nocheck
// Platform bridge + device/commerce (legacy AppInfo + TransferPlatform).
import { director, macro, native, profiler, ResolutionPolicy, screen, size, sys, view } from "cc";
import { AbstractSystem } from "../../framework/QFramework";
import GameConfig from "../config/GameConfig";
import MD5 from "../utility/MD5";
import PushEvent from "../event/PushEvent";
import URLConfig from "../config/URLConfig";
import BundleNameDefined from "../config/BundleNameDefined";
import { TweenUtil as TweenTool } from "../utility/TweenUtil";
import ReportConfig from "../config/ReportConfig";
import { ToolUtils } from "../utility/LegacyToolUtils";
import { GameApp } from "../GameApp";
import { GameEventSystem } from "./GameEventSystem";
import { I18NSystem } from "./I18NSystem";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import SoundManager from "./PlatformSoundStub";
import HttpManager from "./PlatformHttpStub";
import { PlatformUtil } from "../utility/PlatformUtil";

const TLog = {
    printError(msg: string, err?: unknown): void {
        LogKit.E("{0} {1}", msg, err != null ? String(err) : "");
    },
};

// #region IPlatform

export type PlatformKind = "web" | "android" | "ios";

export interface IPlatform {
    readonly kind: PlatformKind;
    /** H5：从 UA 填充设备字段 */
    initBrowserDeviceData(host: PlatformSystem): void;
}

export class WebPlatform implements IPlatform {
    readonly kind: PlatformKind = "web";

    initBrowserDeviceData(host: PlatformSystem): void {
        host.initBrowserDeviceDataFromUserAgent();
    }
}

export class AndroidPlatform implements IPlatform {
    readonly kind: PlatformKind = "android";

    initBrowserDeviceData(_host: PlatformSystem): void {}
}

export class IosPlatform implements IPlatform {
    readonly kind: PlatformKind = "ios";

    initBrowserDeviceData(_host: PlatformSystem): void {}
}

function createPlatformImpl(): IPlatform {
    if (PlatformUtil.IsAndroidPlatform()) {
        return new AndroidPlatform();
    }
    if (PlatformUtil.IsIosPlatform()) {
        return new IosPlatform();
    }
    return new WebPlatform();
}

// #endregion


const LUCKY_ANDROID = "com/lucky/rummy/LuckyAppInfo";
const LUCKY_IMAGE_CROP = "com/lucky/rummy/LuckyImageCrop";
const ZEOY_ANDROID = "com/zeoy/rummy/ZeoyAppInfo";
const ZEOY_IMAGE_CROP = "com/zeoy/rummy/ZeoyImageCrop";
const IOS_BRIDGE = "YsryPlatform";

let androidBridgeClass = LUCKY_ANDROID;
let imageCropClass = LUCKY_IMAGE_CROP;

function getAndroidBridgeClass(): string {
    return androidBridgeClass;
}

function getImageCropClass(): string {
    return imageCropClass;
}

function getIosBridgeClass(): string {
    return IOS_BRIDGE;
}

function methodPrefix(): string {
    return "";
}

function methodSuffix(): string {
    return "";
}

function setZeoyAndroidBridge(): void {
    androidBridgeClass = ZEOY_ANDROID;
    imageCropClass = ZEOY_IMAGE_CROP;
}

const D = {
    get JAVACLASSNAME() { return getAndroidBridgeClass(); },
    get ImageCrop_CLASSNAME() { return getImageCropClass(); },
    get method_pre() { return methodPrefix(); },
    get method_next() { return methodSuffix(); },
    ios_platform: getIosBridgeClass(),
};

export class PlatformSystem extends AbstractSystem {

    private _platformImpl: IPlatform = createPlatformImpl();

    protected OnInit(): void {
        this._platformImpl = createPlatformImpl();
        this._initLegacyPlatform();
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            this.initIsProductVer();
            if (!this.getIsProductVer()) {
                setZeoyAndroidBridge();
            }
        }
        const w = window as any;
        w.PlatformRuntime = this;
        w.PlatformSystem = this;
        w.AppInfo = this;
    }

    get platformKind(): PlatformKind {
        return this._platformImpl.kind;
    }

    /** WebPlatform 入口：从 UA 填充 `_data` */
    initBrowserDeviceDataFromUserAgent(): void {
        let e = window.navigator.userAgent;
        this._data.gaid = MD5.Instance.hex_md5(e + sys.now());
        this._data.imei = MD5.Instance.hex_md5(e + "10000");
        let o = "Mozilla/";
        var t = e.indexOf(o);
        if (-1 != t) {
            var i = e.substring(t + o.length);
            let r = i.indexOf("(");
            if (-1 != r) {
                let e = i.indexOf(")"), t = i.substring(r + 1, e);
                if (t && t.length > 0) {
                    this._data.os_device = t;
                    let a = (t || "").split(";");
                    if (-1 != i.indexOf("iPhone")) {
                        for (let t = 0; t < a.length; t++) {
                            const i = a[t];
                            if (o = "iPhone OS ", r = i.indexOf(o), -1 != r) {
                                let t = i.substring(r + o.length);
                                e = t.indexOf(" ");
                                -1 == e && (e = t.length);
                                let a = t.substring(0, e);
                                a = a.replace(/\s+/g, "");
                                this._data.p_os = a.toLocaleLowerCase();
                            }
                        }
                        this._data.model = "iPhone";
                    }
                    else if (-1 != i.indexOf("Android")) {
                        for (let e = 0; e < a.length; e++) {
                            if (-1 != a[e].indexOf("Android")) {
                                let t = a[e].replace(/\s+/g, "");
                                this._data.p_os = t.toLocaleLowerCase();
                            }
                        }
                        this._data.model = "Android";
                    }
                    else if (-1 != i.indexOf("Windows")) {
                        if (a && a[0] && a[0].length > 0) {
                            let e = a[0].replace(/\s+/g, "");
                            this._data.model = e.toLocaleLowerCase();
                        }
                        if (a && a[1] && a[1].length > 0) {
                            let e = a[1].replace(/\s+/g, "");
                            this._data.p_os = e.toLocaleLowerCase();
                        }
                    }
                }
            }
        }
        o = "Chrome/";
        -1 != (t = e.indexOf(o)) ? this._data.os = "chrome" : (o = "Safari/", -1 != (t = e.indexOf(o)) && (this._data.os = "safari"));
        let a = document.createElement("canvas");
        var n = a.getContext("2d"), s = "http://www.facebook.com/";
        n.textBaseline = "top";
        n.font = "14px 'Arial'";
        n.fillStyle = "#f60";
        n.fillRect(125, 1, 62, 20);
        n.fillStyle = "#069";
        n.fillText(s, 2, 15);
        n.fillStyle = "rgba(102, 204, 0, 0.7)";
        n.fillText(s, 4, 17);
        var l = a.toDataURL().replace("data:image/png;base64,", ""), c = atob(l), h = this.bin2hex(c.slice(-16, -12));
        this._data.mtoken = h;
    }


    _initLegacyPlatform() {
        if (this._urlParam = "", this._data = [], this._pixels_widht = undefined, this._pixels_height = undefined, this._CUR_SCREEN_SIZE_ = null, this._bInitAdjust = false, this._orientationCallback = null, this._uniqueId = "", this._deviceType = "", this._brand = "", this._androidId = "", this._mobileReleaseVersion = "", this._appOsVersion = "", this._appOsVersionName = "", this._osDeviceInfo = "", this._channelId = "", this._cpuName = "", this._cpuHz = -1, this._memorySize = -1, this._avilMemorySize = -1, this._lanuchTime = -1, this._isProductVer = true, ToolUtils._orientation_landscape = false, this._data.channel_id = "", this._data.device = "", this._data.uuid = "", this._data.imsi = "", this._data.imei = "", this._data.p_os = "", this._data.p_name = "", this._data.gaid = "", this._data.brand = "", this._data.os = "h5", this._data.os_device = "", "MOBILE_BROWSER" == sys.platform || "DESKTOP_BROWSER" == sys.platform) {
            this._platformImpl.initBrowserDeviceData(this);
        }
        1 === GameConfig.SERVER_DEBUG && GameConfig.HTTP_MSG_DEBUG;
        profiler.hideStats();
        
    
    }

bin2hex(e) {
        for (var t = "", i = /[0-9a-zA-Z_.~!*()]/, r = 0, o = e.length; r < o; r++) {
            i.test(e.charAt(r)) ? t += e.charCodeAt(r).toString(16) : t += encodeURIComponent(e.charAt(r)).replace(/%/g, "");
        }
        return t;
    }
    setAutoAdapt(e = 0) {
        let t, i, r = view.getVisibleSize(), o = view.getVisibleSizeInPixel(), a = (view.getScaleX(), view.getScaleY(), o.width, r.width, o.height, r.height, r.height, r.width, 1280 / 720);
        if (0 == e) {
            let e = o.height / o.width;
            if (this._CUR_SCREEN_SIZE_ && (e = this._CUR_SCREEN_SIZE_.height / this._CUR_SCREEN_SIZE_.width), e < a ? (i = 1280, t = 1280 / e, view.setDesignResolutionSize(t, i, ResolutionPolicy.FIXED_HEIGHT)) : (t = 720, i = t * e, view.setDesignResolutionSize(t, i, ResolutionPolicy.FIXED_WIDTH)), null == this._CUR_SCREEN_SIZE_) {
                this._CUR_SCREEN_SIZE_ = size(t, i);
                let e = screen.windowSize;
                this._pixels_widht = e.width;
                this._pixels_height = e.height;
                GameConfig.REAL_SCREEN_WIDTH = t;
                GameConfig.REAL_SCREEN_HEIGHT = i;
            }
        }
        else {
            let e = o.width / o.height;
            if (this._CUR_SCREEN_SIZE_ && (e = this._CUR_SCREEN_SIZE_.height / this._CUR_SCREEN_SIZE_.width), e < a ? (i = 1280, t = 1280 / e, view.setDesignResolutionSize(i, t, ResolutionPolicy.FIXED_WIDTH)) : (t = 720, i = t * e, view.setDesignResolutionSize(i, t, ResolutionPolicy.FIXED_HEIGHT)), null == this._CUR_SCREEN_SIZE_) {
                this._CUR_SCREEN_SIZE_ = size(t, i);
                let e = screen.windowSize;
                this._pixels_widht = e.width;
                this._pixels_height = e.height;
            }
        }
    }
    getCurScreenSize() {
        if (null != this._CUR_SCREEN_SIZE_) {
            return;
        }
        let e = view.getScaleX(), t = (view.getScaleY(), GameConfig.CONFIG_SCREEN_WIDTH), i = GameConfig.CONFIG_SCREEN_HEIGHT, r = view.getVisibleSizeInPixel();
        r.width;
        i = r.height / e;
        this._CUR_SCREEN_SIZE_ = size(t, i);
        let o = screen.windowSize;
        this._pixels_widht = o.width;
        this._pixels_height = o.height;
    }
    getWindowSize() {
        let e = screen.windowSize, t = ToolUtils.getPrintJsonStr(e), i = (view.getScaleX(), view.getScaleY(), view.getDesignResolutionSize());
        t = ToolUtils.getPrintJsonStr(i);
        let r = view.getVisibleSizeInPixel();
        t = ToolUtils.getPrintJsonStr(r);
        let o = view.getFrameSize();
        t = ToolUtils.getPrintJsonStr(o);
    }
    getscaleX() {
        let e = view.getScaleX();
        return e = Math.abs(e), e;
    }
    getscaleY() {
        let e = view.getScaleY();
        return e = Math.abs(e), e;
    }
    setH5SystemBarsDark(enabled: boolean, r = 38, g = 8, b = 17) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID) return;
        try {
            native.reflection.callStaticMethod("com/lucky/rummy/LuckyAppInfo", "setH5SystemBarsDark", "(ZIII)V", enabled, r, g, b);
        }
        catch (e) {
            TLog.printError("setH5SystemBarsDark:", e);
        }
    }
    orientationToPortrait(e = null) {
        if (this.getCurScreenSize(), this._orientationCallback = e, !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
                try {
                    native.reflection.callStaticMethod("ViewController", "setOrientation:", "V");
                }
                catch (e) {
                }
            }
        }
        else {
            let e = D.method_pre + "changeLuckyOrientationToPortrait" + D.method_next;
            this._isProductVer || (e = D.method_pre + "changeZeoyOrientationToPortrait" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I");
            }
            catch (e) {
            }
        }
        view.setOrientation(macro.ORIENTATION_PORTRAIT);
        "MOBILE_BROWSER" == sys.platform && sys.isObjectValid(window.AndroidBridge) && window.AndroidBridge.setScreenOrientation("portrait");
        screen.windowSize = size(this._pixels_widht, this._pixels_height);
        sys.isNative || (view.setDesignResolutionSize(this._CUR_SCREEN_SIZE_.width, this._CUR_SCREEN_SIZE_.height, ResolutionPolicy.FIXED_WIDTH), ToolUtils._orientation_landscape = false, this._orientationCallback && this._orientationCallback());
    }
    orientationToLandscape(e = null) {
        if (this.getCurScreenSize(), this._orientationCallback = e, !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
                try {
                    native.reflection.callStaticMethod("ViewController", "setOrientation:", "H");
                }
                catch (e) {
                }
            }
        }
        else {
            let e = D.method_pre + "changeLuckyOrientationToLandscape" + D.method_next;
            this._isProductVer || (e = D.method_pre + "changeZeoyOrientationToLandscape" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I");
            }
            catch (e) {
            }
        }
        view.setOrientation(macro.ORIENTATION_LANDSCAPE);
        "MOBILE_BROWSER" == sys.platform && sys.isObjectValid(window.AndroidBridge) && window.AndroidBridge.setScreenOrientation("landscape");
        screen.windowSize = size(this._pixels_height, this._pixels_widht);
        sys.isNative || (view.setDesignResolutionSize(this._CUR_SCREEN_SIZE_.height, this._CUR_SCREEN_SIZE_.width, ResolutionPolicy.FIXED_HEIGHT), ToolUtils._orientation_landscape = true, this._orientationCallback && this._orientationCallback());
    }
    onScreenSizeChanged(e) {
        let t = view.getVisibleSize(), i = false;
        (1 == ToolUtils.switchSceneTye || -1 == ToolUtils.switchSceneTye && director.getScene().name == BundleNameDefined.rummy_scence || ToolUtils.bSwitchToGame) && (i = true);
        sys.isNative && 0 == Number(e) && 2 == ToolUtils.switchSceneTye && t.width > t.height && (i = false);
        1 == Number(e) || i ? ToolUtils._orientation_landscape || (ToolUtils._orientation_landscape = true, GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.OnScreenSizeChanged), ToolUtils.isPadPlatform() ? view.setDesignResolutionSize(this._CUR_SCREEN_SIZE_.height, this._CUR_SCREEN_SIZE_.width, ResolutionPolicy.FIXED_WIDTH) : view.setDesignResolutionSize(this._CUR_SCREEN_SIZE_.height, this._CUR_SCREEN_SIZE_.width, ResolutionPolicy.FIXED_HEIGHT), ToolUtils.bSwitchToGame = false, this._orientationCallback && this._orientationCallback()) : i || ToolUtils._orientation_landscape && (ToolUtils._orientation_landscape = false, GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.OnScreenSizeChanged), ToolUtils.isPadPlatform() ? view.setDesignResolutionSize(this._CUR_SCREEN_SIZE_.width, this._CUR_SCREEN_SIZE_.height, ResolutionPolicy.FIXED_HEIGHT) : view.setDesignResolutionSize(this._CUR_SCREEN_SIZE_.width, this._CUR_SCREEN_SIZE_.height, ResolutionPolicy.FIXED_WIDTH), ToolUtils.bSwitchToGame = false, this._orientationCallback && this._orientationCallback());
    }
    refreshDesignResolution() {
        null != this._CUR_SCREEN_SIZE_ && (ToolUtils._orientation_landscape ? view.getDesignResolutionSize().width != this._CUR_SCREEN_SIZE_.height && (ToolUtils.isPadPlatform() ? view.setDesignResolutionSize(this._CUR_SCREEN_SIZE_.height, this._CUR_SCREEN_SIZE_.width, ResolutionPolicy.FIXED_WIDTH) : view.setDesignResolutionSize(this._CUR_SCREEN_SIZE_.height, this._CUR_SCREEN_SIZE_.width, ResolutionPolicy.FIXED_HEIGHT)) : view.getDesignResolutionSize().width != this._CUR_SCREEN_SIZE_.width && (ToolUtils.isPadPlatform() ? view.setDesignResolutionSize(this._CUR_SCREEN_SIZE_.width, this._CUR_SCREEN_SIZE_.height, ResolutionPolicy.FIXED_HEIGHT) : view.setDesignResolutionSize(this._CUR_SCREEN_SIZE_.width, this._CUR_SCREEN_SIZE_.height, ResolutionPolicy.FIXED_WIDTH)));
    }
    getOpenUDID() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && sys.os === sys.OS.IOS) {
                try {
                    let e = native.reflection.callStaticMethod(D.ios_platform, "getYsPhoneUUid:", "");
                    if (e) {
                        return ToolUtils.isSafeString(e);
                    }
                }
                catch (e) {
                    return TLog.printError("getOpenUDID:", e), "";
                }
            }
        }
        else {
            if (this._androidId.length > 0) {
                return this._androidId;
            }
            try {
                let e = D.method_pre + "getLuckyAndroidId" + D.method_next;
                this._isProductVer || (e = D.method_pre + "getZeoyAndroidId" + D.method_next);
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                return t ? (this._androidId = ToolUtils.isSafeString(t), ToolUtils.isSafeString(t)) : "";
            }
            catch (e) {
                return TLog.printError("getOpenUDID:", e), "";
            }
        }
        return "";
    }
    getUrlParam() {
        return this._urlParam;
    }
    getPhoneIMEI() {
        sys.localStorage.getItem("logintype");
        if (1 === GameConfig.SERVER_DEBUG) {
            let e = sys.localStorage.getItem("phoneimei");
            if (ToolUtils.isSafeString(e).length > 0) {
                return ToolUtils.isSafeString(e);
            }
        }
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && sys.os === sys.OS.IOS) {
                if (this._androidId.length > 0) {
                    return this._androidId;
                }
                try {
                    let e = native.reflection.callStaticMethod(D.ios_platform, "getYsPhoneUUid:", "");
                    if (e) {
                        return ToolUtils.saveData("phoneimei", ToolUtils.isSafeString(e)), this._androidId = ToolUtils.isSafeString(e), ToolUtils.isSafeString(e);
                    }
                }
                catch (e) {
                    return TLog.printError("getPhoneIMEI:", e), "";
                }
            }
            else if (sys.os == sys.OS.WINDOWS || sys.os == sys.OS.OSX) {
                return this._data.imei;
            }
        }
        else {
            if (this._androidId.length > 0) {
                return this._androidId;
            }
            let e = D.method_pre + "getLuckyAndroidId" + D.method_next;
            this._isProductVer || (e = D.method_pre + "getZeoyAndroidId" + D.method_next);
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                return t ? (ToolUtils.saveData("phoneimei", ToolUtils.isSafeString(t)), this._androidId = ToolUtils.isSafeString(t), ToolUtils.isSafeString(t)) : "";
            }
            catch (e) {
                return TLog.printError("getPhoneIMEI:", e), "";
            }
        }
        return "";
    }
    getPhoneIMSI() {
        return sys.os == sys.OS.WINDOWS || sys.os == sys.OS.OSX ? this._data.imsi : "";
    }
    getPhoneBrand() {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            if (this._brand.length > 0) {
                return this._brand;
            }
            let e = D.method_pre + "getLuckyMobileBrand" + D.method_next;
            this._isProductVer || (e = D.method_pre + "getZeoyMobileBrand" + D.method_next);
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                return t ? (this._brand = ToolUtils.isSafeString(t), ToolUtils.isSafeString(t)) : "";
            }
            catch (e) {
                return TLog.printError("getMobileBrand:", e), "";
            }
            return "";
        }
        if (sys.isNative && sys.os == sys.OS.IOS) {
            if (this._brand.length > 0) {
                return this._brand;
            }
            try {
                let e = native.reflection.callStaticMethod(D.ios_platform, "getMobileBrand:", "");
                if (e) {
                    return this._brand = ToolUtils.isSafeString(e), ToolUtils.isSafeString(e);
                }
            }
            catch (e) {
                return TLog.printError("getPhoneBrand:", e), "";
            }
        }
        else if (sys.os == sys.OS.WINDOWS) {
            return this._data.brand;
        }
        return "";
    }
    getOS() {
        return sys.os + "";
    }
    getPhoneOS() {
        return sys.os + "";
    }
    getPhoneName() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.os == sys.OS.WINDOWS || sys.os == sys.OS.OSX) {
                return this._data.p_name;
            }
        }
        else {
            let e = D.method_pre + "getLuckyPhoneDeviceType" + D.method_next;
            this._isProductVer || (e = D.method_pre + "getZeoyPhoneDeviceType" + D.method_next);
            try {
                if (this._deviceType.length > 0) {
                    return this._deviceType;
                }
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                if (t) {
                    return ToolUtils.isSafeString(t).length > 0 && (this._deviceType = ToolUtils.isSafeString(t)), ToolUtils.isSafeString(t);
                }
            }
            catch (e) {
                return TLog.printError("getPhoneDeviceType:", e), "";
            }
        }
        return sys.os;
    }
    getPhoneUUID() {
        return sys.os == sys.OS.WINDOWS || sys.os == sys.OS.OSX ? this._data.uuid : "";
    }
    getGaid() {
        if (1 === GameConfig.SERVER_DEBUG || "MOBILE_BROWSER" == sys.platform || "DESKTOP_BROWSER" == sys.platform) {
            let e = sys.localStorage.getItem("gaid");
            if (ToolUtils.isSafeString(e).length > 0) {
                return this.checkGoogleId(), ToolUtils.isSafeString(e);
            }
        }
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            if (this._uniqueId.length > 0 && -1 == this._uniqueId.indexOf("td-")) {
                return this._uniqueId;
            }
            let e = sys.localStorage.getItem("MasterRummy_GAID_ID");
            if (sys.isObjectValid(e) && ToolUtils.isSafeString(e).length > 0) {
                return this._uniqueId = e, this._uniqueId;
            }
            let t = D.method_pre + "getLuckyGoogleAdId" + D.method_next;
            this._isProductVer || (t = D.method_pre + "getZeoyGoogleAdId" + D.method_next);
            try {
                let e = native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "()Ljava/lang/String;");
                if (e && ToolUtils.isSafeString(e).length > 5 && "00000000-0000-0000-0000-000000000000" != ToolUtils.isSafeString(e)) {
                    return this._uniqueId = ToolUtils.isSafeString(e), -1 == this._uniqueId.indexOf("td-") && ToolUtils.saveData("MasterRummy_GAID_ID", this._uniqueId), this._uniqueId;
                }
            }
            catch (e) {
            }
            return this.getPhoneIMEI().length > 3 ? this._uniqueId = "td-" + this.getPhoneIMEI() : this.getAppInstanceId().length > 3 && (this._uniqueId = "td-" + this.getAppInstanceId()), -1 == this._uniqueId.indexOf("td-") && ToolUtils.saveData("MasterRummy_GAID_ID", this._uniqueId), this._uniqueId;
        }
        if (sys.isNative && sys.os === sys.OS.IOS) {
            if (this._uniqueId.length > 0) {
                return this._uniqueId;
            }
            try {
                let e = native.reflection.callStaticMethod(D.ios_platform, "getDeviceUdid:", "");
                if (e) {
                    return this._uniqueId = ToolUtils.isSafeString(e), ToolUtils.isSafeString(e);
                }
            }
            catch (e) {
                return "";
            }
        }
        else if (sys.os == sys.OS.WINDOWS || sys.os == sys.OS.OSX) {
            return this._data.gaid;
        }
        return "";
    }
    getDeviceType() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
                return "";
            }
        }
        else {
            if (this._deviceType.length > 0) {
                return this._deviceType;
            }
            let e = D.method_pre + "getLuckyPhoneDeviceType" + D.method_next;
            this._isProductVer || (e = D.method_pre + "getZeoyPhoneDeviceType" + D.method_next);
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                if (t) {
                    return ToolUtils.isSafeString(t).length > 0 && (this._deviceType = ToolUtils.isSafeString(t)), ToolUtils.isSafeString(t);
                }
            }
            catch (e) {
                return "";
            }
        }
        return sys.os;
    }
    getMobileRelease() {
        if (this._mobileReleaseVersion.length > 0) {
            return this._mobileReleaseVersion;
        }
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let e = D.method_pre + "getLuckyMobileRelease" + D.method_next;
            this._isProductVer || (e = D.method_pre + "getZeoyMobileRelease" + D.method_next);
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                if (t) {
                    return this._mobileReleaseVersion = "Android:" + ToolUtils.isSafeString(t), "Android:" + ToolUtils.isSafeString(t);
                }
            }
            catch (e) {
                return "";
            }
            return "";
        }
        return sys.isNative && sys.os === sys.OS.IOS ? sys.osVersion : sys.os;
    }
    getAppVersionCode() {
        if (this._appOsVersion.length > 0) {
            return this._appOsVersion;
        }
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && sys.os === sys.OS.IOS) {
                try {
                    let e = native.reflection.callStaticMethod(D.ios_platform, "getYsOsVersion:", "");
                    if (e) {
                        return this._appOsVersion = ToolUtils.isSafeString(e), ToolUtils.isSafeString(e);
                    }
                }
                catch (e) {
                }
            }
        }
        else {
            let e = D.method_pre + "getZeoyOsVersion" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                if (t) {
                    return this._appOsVersion = ToolUtils.isSafeString(t), ToolUtils.isSafeString(t);
                }
            }
            catch (e) {
                return "0";
            }
        }
        return "1";
    }
    getAppVersionName() {
        if (this._appOsVersionName.length > 0) {
            return this._appOsVersionName;
        }
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let e = D.method_pre + "getApplicationVersion" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                return t ? (this._appOsVersionName = ToolUtils.isSafeString(t), ToolUtils.isSafeString(t)) : GameConfig.NEW_APP_VERSION;
            }
            catch (e) {
                return GameConfig.NEW_APP_VERSION;
            }
        }
        return GameConfig.NEW_APP_VERSION;
    }
    getOsDeviceInfo() {
        if (this._osDeviceInfo.length > 0) {
            return this._osDeviceInfo;
        }
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let e = D.method_pre + "getLuckyOsDeviceInfo" + D.method_next;
            this._isProductVer || (e = D.method_pre + "getZeoyOsDeviceInfo" + D.method_next);
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                return t ? (this._osDeviceInfo = ToolUtils.isSafeString(t), ToolUtils.isSafeString(t)) : "";
            }
            catch (e) {
                return TLog.printError("getLuckyOsDeviceInfo:", e), "";
            }
            return "";
        }
        if (sys.isNative && (sys.os == sys.OS.IOS || sys.os === sys.OS.OSX)) {
            try {
                let e = native.reflection.callStaticMethod(D.ios_platform, "getOsDeviceInfo:", "");
                if (e) {
                    return this._osDeviceInfo = ToolUtils.isSafeString(e), ToolUtils.isSafeString(e);
                }
            }
            catch (e) {
                return TLog.printError("getOsDeviceInfo:", e), "";
            }
        }
        return "";
    }
    getDeviceVersion() {
        return sys.os + sys.osVersion;
    }
    initLobbyThemeType() {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let t = D.method_pre + "getLobbyThemeType" + D.method_next;
            try {
                let e = native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "()I");
                sys.isObjectValid(e) && (GameConfig.GAME_APP_THEME = Number(e), GameConfig.GAME_HALL_THEME = GameConfig.GAME_APP_THEME);
            }
            catch (t) {
                TLog.printError("getLobbyThemeType:", t);
                let i = this.getChannelId();
                ["2000580", "2000581", "2000582", "1100300", "1100301", "1100302", "1100303", "1100304", "1100305", "1100600", "1100601", "1100602", "1100603", "1100604", "1100605", "1100606", "1100500", "1100501", "1100502"].includes(String(i)) ? GameConfig.GAME_APP_THEME = 1 : GameConfig.GAME_APP_THEME = 0;
                GameConfig.GAME_HALL_THEME = GameConfig.GAME_APP_THEME;
            }
        }
    }
    initIsProductVer() {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            0 != parseFloat(this.getAppVersionCode()) ? this._isProductVer = true : (setZeoyAndroidBridge(), this._isProductVer = false);
        }
    }
    getIsProductVer() {
        return this._isProductVer;
    }
    getChannelId() {
        if (this._channelId.length > 0) {
            return GameConfig.CHANNEL_ID = Number(this._channelId), GameConfig.CHANNEL_ID;
        }
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (!sys.isNative || sys.os !== sys.OS.IOS && sys.os !== sys.OS.OSX) {
                if (!sys.isNative) {
                    return GameConfig.CHANNEL_ID;
                }
                GameConfig.CHANNEL_ID = 2000005;
            }
            else {
                try {
                    let e = native.reflection.callStaticMethod(D.ios_platform, "getYsryChannelId:", "");
                    return GameConfig.CHANNEL_ID = Number(e), this._channelId = e + "", GameConfig.CHANNEL_ID;
                }
                catch (e) {
                    return GameConfig.CHANNEL_ID = 2000005, GameConfig.CHANNEL_ID;
                }
            }
        }
        else {
            let e = D.method_pre + "getLuckyChannelId" + D.method_next;
            this._isProductVer || (e = D.method_pre + "getZeoyChannelId" + D.method_next);
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                if (t) {
                    return this._channelId = t, GameConfig.CHANNEL_ID = Number(this._channelId), Number(this._channelId);
                }
            }
            catch (e) {
                return TLog.printError("getChannelId:", e), GameConfig.CHANNEL_ID = 2000005, GameConfig.CHANNEL_ID;
            }
        }
    }
    getPasteBoard() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (!sys.isNative || sys.os !== sys.OS.IOS) {
                return "";
            }
            try {
                let e = native.reflection.callStaticMethod(D.ios_platform, "getPasteBoard:", "");
                if (e) {
                    return ToolUtils.isSafeString(e);
                }
            }
            catch (e) {
                return TLog.printError("getPasteBoard:", e), "";
            }
        }
        else {
            let e = D.method_pre + "getLuckyPasteBoard" + D.method_next;
            this._isProductVer || (e = D.method_pre + "getZeoyPasteBoard" + D.method_next);
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                if (t) {
                    return t;
                }
            }
            catch (e) {
                return TLog.printError("getPasteBoard:", e), "";
            }
        }
    }
    sendEmail(e, t, i) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 0;
        }
        {
            let r = D.method_pre + "sendLuckyEmail" + D.method_next;
            this._isProductVer || (r = D.method_pre + "sendZeoyEmail" + D.method_next);
            try {
                let o = native.reflection.callStaticMethod(D.JAVACLASSNAME, r, "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)I", e, t, i);
                return o || 0;
            }
            catch (e) {
                return TLog.printError("sendEmail:", e), 0;
            }
        }
    }
    copyContent(e) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && sys.os === sys.OS.IOS) {
                try {
                    native.reflection.callStaticMethod(D.ios_platform, "copyYsContent:", String(e));
                }
                catch (e) {
                    return TLog.printError("copyContent:", e), "";
                }
            }
            else if (!sys.isNative) {
                let t = document.createElement("textarea");
                t.textContent = e;
                document.body.appendChild(t);
                t.readOnly = true;
                t.select();
                t.setSelectionRange(0, t.textContent.length);
                try {
                    document.execCommand("copy");
                    document.body.removeChild(t);
                }
                catch (e) {
                    TLog.printError("copyContent:", e);
                }
            }
        }
        else {
            let t = D.method_pre + "copyLuckyContent" + D.method_next;
            this._isProductVer || (t = D.method_pre + "copyZeoyContent" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)V", e);
            }
            catch (e) {
                TLog.printError("copyContent:", e);
            }
        }
    }
    shareTextToApp(e, t) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
                if ("com.facebook.katana" == e) {
                    native.bridge.sendToNative("shareYsryLinkToFacebook", t);
                }
                else {
                    "com.twitter.android" == e ? e = "twitter" : "com.whatsapp" == e ? e = "whatsapp" : "org.telegram.messenger" != e && "org.telegram.messenger.web" != e || (e = "tg");
                    try {
                        native.reflection.callStaticMethod(D.ios_platform, "shareYsryTextToApp:andYsrySharedText:", e, t);
                    }
                    catch (e) {
                        return TLog.printError("shareTextToApp:", e), "";
                    }
                }
            }
        }
        else {
            let i = D.method_pre + "shareLuckyTextToApp" + D.method_next;
            this._isProductVer || (i = D.method_pre + "shareZeoyTextToApp" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, i, "(Ljava/lang/String;Ljava/lang/String;)V", e, t);
            }
            catch (e) {
                TLog.printError("shareTextToApp:", e);
            }
        }
    }
    shareWebPage(e) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (!sys.isNative || sys.os !== sys.OS.IOS && sys.os !== sys.OS.OSX) {
                sys.openURL(e);
            }
            else {
                try {
                    native.reflection.callStaticMethod(D.ios_platform, "shareYsryWebPage:", e);
                }
                catch (e) {
                    return TLog.printError("AppInfo_ios.shareWebPage:", e), "";
                }
            }
        }
        else {
            let t = D.method_pre + "shareLuckyWebPage" + D.method_next;
            this._isProductVer || (t = D.method_pre + "shareZeoyWebPage" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)V", e);
            }
            catch (e) {
                TLog.printError("shareWebPage:", e);
            }
        }
    }
    shareToFacebook2(e, t, i, o, n, s) {
        if (window[e] = t, !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && sys.os === sys.OS.IOS) {
                try {
                    let t = "window." + e + "." + i, r = {};
                    r.callbackName = t;
                    r.sharedText = o;
                    r.imgPath = n;
                    r.imgFileName = s;
                    native.reflection.callStaticMethod(D.ios_platform, "shareYsryToFacebook2:", ToolUtils.toJsonString(r));
                }
                catch (e) {
                    TLog.printError("shareTextToApp:", e);
                }
            }
        }
        else {
            let t = D.method_pre + "shareLuckyToFacebook2" + D.method_next;
            this._isProductVer || (t = D.method_pre + "shareZeoyToFacebook2" + D.method_next);
            try {
                let r = "window." + e + "." + i;
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", r, o, n, s);
            }
            catch (e) {
                TLog.printError("shareTextToApp:", e);
            }
        }
    }
    shareToWhatsapp2(e, t, i, o, n, s) {
        if (window[e] = t, !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && sys.os === sys.OS.IOS) {
                try {
                    let t = "window." + e + "." + i, r = {};
                    r.callbackName = t;
                    r.sharedText = o;
                    r.imgPath = n;
                    r.imgFileName = s;
                    native.reflection.callStaticMethod(D.ios_platform, "shareYsryToWhatsapp2:", ToolUtils.toJsonString(r));
                }
                catch (e) {
                    TLog.printError("shareTextToApp:", e);
                }
            }
        }
        else {
            let t = D.method_pre + "shareLuckyToWhatsapp2" + D.method_next;
            this._isProductVer || (t = D.method_pre + "shareZeoyToWhatsapp2" + D.method_next);
            try {
                let r = "window." + e + "." + i;
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", r, o, n, s);
            }
            catch (e) {
                TLog.printError("shareTextToApp:", e);
            }
        }
    }
    shareToTwitter2(e, t, i, o, n, s) {
        if (window[e] = t, !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && sys.os === sys.OS.IOS) {
                try {
                    let t = "window." + e + "." + i, r = {};
                    r.callbackName = t;
                    r.sharedText = o;
                    r.imgPath = n;
                    r.imgFileName = s;
                    native.reflection.callStaticMethod(D.ios_platform, "shareYsryToTwitter2:", ToolUtils.toJsonString(r));
                }
                catch (e) {
                    TLog.printError("shareTextToApp:", e);
                }
            }
        }
        else {
            let t = D.method_pre + "shareLuckyToTwitter2" + D.method_next;
            this._isProductVer || (t = D.method_pre + "shareZeoyToTwitter2" + D.method_next);
            try {
                let r = "window." + e + "." + i;
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", r, o, n, s);
            }
            catch (e) {
                TLog.printError("shareTextToApp:", e);
            }
        }
    }
    shareToTelegram2(e, t, i, o, n, s, l, c) {
        if (window[e] = t, !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && sys.os === sys.OS.IOS) {
                try {
                    let t = "window." + e + "." + i, r = {};
                    r.callbackName = t;
                    r.sharedText = o;
                    r.imgPath = s;
                    r.imgFileName = l;
                    native.reflection.callStaticMethod(D.ios_platform, "shareYsryToTelegram2:", ToolUtils.toJsonString(r));
                }
                catch (e) {
                    TLog.printError("shareToTelegram2:", e);
                }
            }
        }
        else {
            let t = D.method_pre + "shareLuckyToTelegram2" + D.method_next;
            this._isProductVer || (t = D.method_pre + "shareZeoyToTelegram2" + D.method_next);
            try {
                let r = "window." + e + "." + i;
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", r, o, n, s, l, c);
            }
            catch (e) {
                TLog.printError("shareToTelegram2:", e);
            }
        }
    }
    checkLocationPermission() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 1;
        }
        {
            let e = D.method_pre + "checkLuckyLocationPermission" + D.method_next;
            this._isProductVer || (e = D.method_pre + "checkZeoyLocationPermission" + D.method_next);
            try {
                return native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I");
            }
            catch (e) {
                return TLog.printError("checkLocationPermission,error:", e), 1;
            }
        }
    }
    checkOpenLocationService() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 1;
        }
        {
            let e = D.method_pre + "checkLuckyOpenLocationService" + D.method_next;
            this._isProductVer || (e = D.method_pre + "checkZeoyOpenLocationService" + D.method_next);
            try {
                return native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I");
            }
            catch (e) {
                return TLog.printError("AppInfo.checkOpenLocationService,error:", e), 1;
            }
        }
    }
    checkOpenLocationPermission() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 1;
        }
        {
            let e = D.method_pre + "checkLuckyOpenLocationPermission" + D.method_next;
            this._isProductVer || (e = D.method_pre + "checkZeoyOpenLocationPermission" + D.method_next);
            try {
                return native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I");
            }
            catch (e) {
                return TLog.printError("AppInfo.checkOpenLocationPermission,error:", e), 1;
            }
        }
    }
    checkCameraPermission() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 1;
        }
        {
            let e = D.method_pre + "checkLuckyCameraPermission" + D.method_next;
            this._isProductVer || (e = D.method_pre + "checkZeoyCameraPermission" + D.method_next);
            try {
                return native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I");
            }
            catch (e) {
                return TLog.printError("AppInfo.checkCameraPermission,error:", e), 1;
            }
        }
    }
    checkStoragePermission() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 1;
        }
        {
            let e = D.method_pre + "checkLuckyStoragePermission" + D.method_next;
            this._isProductVer || (e = D.method_pre + "checkZeoyStoragePermission" + D.method_next);
            try {
                return native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I");
            }
            catch (e) {
                return TLog.printError("AppInfo.checkStoragePermission,error:", e), 1;
            }
        }
    }
    jumpToLocationService() {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let e = D.method_pre + "jumpLuckyToLocationService" + D.method_next;
            this._isProductVer || (e = D.method_pre + "jumpZeoyToLocationService" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()V");
            }
            catch (e) {
                TLog.printError("jumpToLocationService,error:", e);
            }
        }
    }
    jumpToPermissionSetting() {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let e = D.method_pre + "jumpLuckyToPermissionSetting" + D.method_next;
            this._isProductVer || (e = D.method_pre + "jumpZeoyToPermissionSetting" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()V");
            }
            catch (e) {
                TLog.printError("jumpToPermissionSetting,error:", e);
            }
        }
    }
    getLocationInfo(e = "1") {
        if ( !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (!sys.isNative || sys.os !== sys.OS.IOS) {
                return "";
            }
            try {
                native.reflection.callStaticMethod(D.ios_platform, "getYsryLocationInfo:", e);
            }
            catch (e) {
                TLog.printError("getLocationInfo:", e);
            }
        }
        else {
            let e = D.method_pre + "getLuckyLocationInfo" + D.method_next;
            this._isProductVer || (e = D.method_pre + "getZeoyLocationInfo" + D.method_next);
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                if (t) {
                    return t;
                }
            }
            catch (e) {
                return TLog.printError("getLocationInfo:", e), "";
            }
        }
    }
    showLocationSwitchGuide() {
        if ( !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return sys.isNative && (sys.os, sys.OS.IOS), 0;
        }
        {
            let e = D.method_pre + "showLocationSwitchGuide" + D.method_next;
            this._isProductVer || (e = D.method_pre + "showLocationSwitchGuide" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I");
            }
            catch (e) {
                return TLog.printError("showLocationSwitchGuide:", e), 0;
            }
        }
    }
    startFacebookLogin(e, t, i, o) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
                try {
                    let t = {};
                    t.class_name = e;
                    t.callbackName = i;
                    native.bridge.sendToNative("startYsryFacebookLogin", ToolUtils.toJsonString(t));
                }
                catch (e) {
                    TLog.printError("startFacebookLogin,error:", e);
                    this.handleSdkErrorCallBack("startFacebookLogin err:" + e.toString());
                }
            }
        }
        else {
            window[e] = t;
            let r = D.method_pre + "doLuckyFaceBookLogin" + D.method_next;
            this._isProductVer || (r = D.method_pre + "doZeoyFaceBookLogin" + D.method_next);
            try {
                let t = "window." + e + "." + i;
                native.reflection.callStaticMethod(D.JAVACLASSNAME, r, "(Ljava/lang/String;Ljava/lang/String;)V", t, o);
            }
            catch (e) {
                TLog.printError("startFacebookLogin:", e);
                this.handleSdkErrorCallBack("startFacebookLogin err:" + e.toString());
            }
        }
    }
    showZeoyWebViewByColor(e, t, i) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            sys.openURL(t);
        }
        else {
            let r = D.method_pre + "showLuckyWebViewByColor" + D.method_next;
            this._isProductVer || (r = D.method_pre + "showZeoyWebViewByColor" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, r, "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", e, t, i);
            }
            catch (e) {
                TLog.printError("Appinfo.showLuckyWebViewByColor:", e);
            }
        }
    }
    showZeoyWebView(e, t, i) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            sys.openURL(t);
        }
        else {
            let e = D.method_pre + "showLuckyWebView" + D.method_next;
            this._isProductVer || (e = D.method_pre + "showZeoyWebView" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "(Ljava/lang/String;Ljava/lang/String;)V", t, i);
            }
            catch (e) {
                TLog.printError("Appinfo.showLuckyWebView:", e);
            }
        }
    }
    showSupportWebView(url, title) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID) {
            sys.openURL(url);
            return;
        }
        native.reflection.callStaticMethod("com/lucky/rummy/LuckyAppInfo", "showSupportWebView", "(Ljava/lang/String;Ljava/lang/String;)V", title, url);
    }
    openPhoto(t, i, o, n) {
        if ( !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
                try {
                    let e = {};
                    e.img_name = t;
                    e.width = GameConfig.REAL_SCREEN_WIDTH;
                    e.height = GameConfig.REAL_SCREEN_HEIGHT;
                    native.reflection.callStaticMethod("ViewController", "openPhoto:", ToolUtils.toJsonString(e));
                }
                catch (e) {
                    return TLog.printError("ViewController.openPhoto:", e), "";
                }
            }
        }
        else {
            0 === this.checkStoragePermission() && (ToolUtils.permission_forbid = false, TweenTool.delayAct(ToolUtils.getPersistGlobalNode(), (() => {
                ToolUtils.permission_forbid && (ToolUtils.permission_forbid = false, this.jumpToPermissionSetting());
            }), 1, true));
            let r = "openLuckyPhoto";
            this._isProductVer || (r = "openZeoyPhoto");
            try {
                native.reflection.callStaticMethod(D.ImageCrop_CLASSNAME, r, "(Ljava/lang/String;III)V", t, i, o, n);
            }
            catch (e) {
                TLog.printError("Appinfo.openPhoto:", e);
            }
        }
    }
    openCamera(t, i, o, n) {
        if ( !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
                try {
                    let e = {};
                    e.img_name = t;
                    e.width = GameConfig.REAL_SCREEN_WIDTH;
                    e.height = GameConfig.REAL_SCREEN_HEIGHT;
                    native.reflection.callStaticMethod("ViewController", "openCamera:", ToolUtils.toJsonString(e));
                }
                catch (e) {
                    return TLog.printError("ViewController.openCamera:", e), "";
                }
            }
        }
        else {
            0 === this.checkCameraPermission() && (ToolUtils.permission_forbid = false, TweenTool.delayAct(ToolUtils.getPersistGlobalNode(), (() => {
                ToolUtils.permission_forbid && (ToolUtils.permission_forbid = false, this.jumpToPermissionSetting());
            }), 1, true));
            let r = "openLuckyCamera";
            this._isProductVer || (r = "openZeoyCamera");
            try {
                native.reflection.callStaticMethod(D.ImageCrop_CLASSNAME, r, "(Ljava/lang/String;III)V", t, i, o, n);
            }
            catch (e) {
                TLog.printError("Appinfo.openCamera:", e);
            }
        }
    }
    openPicture(t, i, o, n) {
        if ( sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            0 === this.checkCameraPermission() && (ToolUtils.permission_forbid = false, TweenTool.delayAct(ToolUtils.getPersistGlobalNode(), (() => {
                ToolUtils.permission_forbid && (ToolUtils.permission_forbid = false, this.jumpToPermissionSetting());
            }), 1, true));
            let r = "openPicture";
            try {
                native.reflection.callStaticMethod(D.ImageCrop_CLASSNAME, r, "(Ljava/lang/String;III)V", t, i, o, n);
            }
            catch (e) {
                TLog.printError("Appinfo.openPicture:", e);
            }
        }
    }
    getAdjust_Adid() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && sys.os === sys.OS.IOS) {
                try {
                    let e = native.reflection.callStaticMethod(D.ios_platform, "getAdjust_Adid:", "");
                    if (e) {
                        return e;
                    }
                }
                catch (e) {
                    TLog.printError("getAdjust_Adid:", e);
                }
            }
        }
        else {
            let e = D.method_pre + "getLuckyAdjust_Adid" + D.method_next;
            this._isProductVer || (e = D.method_pre + "getZeoyAdjust_Adid" + D.method_next);
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                if (t) {
                    return t;
                }
            }
            catch (e) {
                return TLog.printError("getAdjust_Adid:", e), "";
            }
        }
        return "";
    }
    getAppsflyer_Adid() {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let e = D.method_pre + "getLuckyAppsflyer_Adid" + D.method_next;
            this._isProductVer || (e = D.method_pre + "getZeoyAppsflyer_Adid" + D.method_next);
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                if (t) {
                    return t;
                }
            }
            catch (e) {
                return TLog.printError("getAppsflyer_Adid:", e), "";
            }
        }
        return "";
    }
    logEvent_firebase(e, t = 0) {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let i = D.method_pre + "logLuckyEvent_firebase" + D.method_next;
            this._isProductVer || (i = D.method_pre + "logZeoyEvent_firebase" + D.method_next);
            try {
                let r = {};
                r.type = t;
                r.event_name = e;
                native.reflection.callStaticMethod(D.JAVACLASSNAME, i, "(Ljava/lang/String;)V", ToolUtils.toJsonString(r));
            }
            catch (e) {
                TLog.printError("Appinfo.logEvent_firebase:", e);
            }
        }
    }
    getNativeFirebaseToken(e, t, i) {
        if (window[e] = t, !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && sys.os === sys.OS.IOS) {
                try {
                    let t = {};
                    t.class_name = e;
                    t.callbackName = i;
                    native.bridge.sendToNative("getYsryFirebaseToken", ToolUtils.toJsonString(t));
                }
                catch (e) {
                    TLog.printError("getFirebaseToken error:", e);
                }
            }
        }
        else {
            let t = D.method_pre + "getLuckyFirebaseToken" + D.method_next;
            this._isProductVer || (t = D.method_pre + "getZeoyFirebaseToken" + D.method_next);
            try {
                let r = "window." + e + "." + i;
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)V", r);
            }
            catch (e) {
                TLog.printError("Appinfo.getFirebaseToken:", e);
            }
        }
    }
    getFireBaseToken(t = false) {
        return "" == ToolUtils._fireBaseToken ? (t || (ToolUtils._bNeedReportToken = true), this.getNativeFirebaseToken("PlatformSystem", this, "onReportFireBaseToken")) : ToolUtils._bNeedReportToken = false, ToolUtils._fireBaseToken;
    }
    reportFireBaseToken() {
        ToolUtils._bNeedReportToken = true;
        "" == ToolUtils._fireBaseToken ? this.getNativeFirebaseToken("PlatformSystem", this, "onReportFireBaseToken") : this.onReportFireBaseToken(ToolUtils._fireBaseToken);
    }
    onReportFireBaseToken(e) {
        e && "" != e && (ToolUtils._fireBaseToken = e, ToolUtils._bNeedReportToken && HttpManager.shared().doGetLoginAfterAddToken(e, null));
    }
    getFirebasePushId() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && sys.os === sys.OS.IOS) {
                try {
                    let e = native.reflection.callStaticMethod(D.ios_platform, "getYsryFirebasePushId:", "");
                    if (e) {
                        return e;
                    }
                }
                catch (e) {
                    TLog.printError("Appinfo.getFirebasePushId:", e);
                }
            }
        }
        else {
            let e = D.method_pre + "getLuckyFirebasePushId" + D.method_next;
            this._isProductVer || (e = D.method_pre + "getZeoyFirebasePushId" + D.method_next);
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                if (t) {
                    return t;
                }
            }
            catch (e) {
                TLog.printError("Appinfo.getFirebasePushId:", e);
            }
        }
        return "";
    }
    getAppInstanceId() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (!sys.isNative || sys.os !== sys.OS.IOS) {
                return "";
            }
            try {
                let e = native.reflection.callStaticMethod(D.ios_platform, "getYsryAppInstanceId:", "");
                if (e) {
                    return e;
                }
            }
            catch (e) {
                TLog.printError("Appinfo.getAppInstanceId:", e);
            }
        }
        else {
            let e = D.method_pre + "getLuckyInstanceId_firebase" + D.method_next;
            this._isProductVer || (e = D.method_pre + "getZeoyInstanceId_firebase" + D.method_next);
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                if (t) {
                    return t;
                }
            }
            catch (e) {
                TLog.printError("Appinfo.getAppInstanceId:", e);
            }
        }
        return "";
    }
    getFirebaseJumpType(e, t, i) {
        if (window[e] = t, !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && sys.os === sys.OS.IOS) {
                try {
                    let t = "window." + e + "." + i;
                    native.reflection.callStaticMethod(D.ios_platform, "getYsryFirebaseJumpType:", t);
                }
                catch (e) {
                    TLog.printError("Appinfo.getFirebaseJumpType:", e);
                }
            }
        }
        else {
            let t = D.method_pre + "getLuckyFirebaseJumpType" + D.method_next;
            this._isProductVer || (t = D.method_pre + "getZeoyFirebaseJumpType" + D.method_next);
            try {
                let r = "window." + e + "." + i;
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)V", r);
            }
            catch (e) {
                TLog.printError("Appinfo.getFirebaseJumpType:", e);
            }
        }
    }
    getFirebaseExt(e, t, i) {
        if (window[e] = t, !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && sys.os === sys.OS.IOS) {
                try {
                    let t = "window." + e + "." + i;
                    native.reflection.callStaticMethod(D.ios_platform, "getYsryFirebaseExt:", t);
                }
                catch (e) {
                    TLog.printError("Appinfo.getFirebaseExt:", e);
                }
            }
        }
        else {
            let t = D.method_pre + "getLuckyFirebaseExt" + D.method_next;
            this._isProductVer || (t = D.method_pre + "getZeoyFirebaseExt" + D.method_next);
            try {
                let r = "window." + e + "." + i;
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)V", r);
            }
            catch (e) {
                TLog.printError("Appinfo.getFirebaseExt:", e);
            }
        }
    }
    startUdpReport(e, t, i) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
                try {
                    native.reflection.callStaticMethod(D.ios_platform, "startUdpReport:withIp:withPort:", e, t, "" + i);
                }
                catch (e) {
                    return TLog.printError("Appinfo.startUdpReport:", e), "";
                }
            }
        }
        else {
            let r = D.method_pre + "startUdpReport" + D.method_next;
            this._isProductVer || (r = D.method_pre + "startUdpReport" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, r, "(Ljava/lang/String;Ljava/lang/String;I)V", e, t, i);
            }
            catch (e) {
                TLog.printError("Appinfo.startUdpReport:", e);
            }
        }
    }
    getCameraPermissionCallback(e) {
        -1 === Number(e) && (ToolUtils.permission_forbid = true);
    }
    getLocalImage(e, t) {
        sys.isNative && sys.os === sys.OS.IOS && (e = native.fileUtils.getWritablePath() + "kycImage/" + e + ".jpg");
        try {
            let i = { img_path: e, img_data: t };
            GameApp.Interface.GetSystem(GameEventSystem).emit(GameConfig.GetLocalImage, i);
        }
        catch (e) {
            TLog.printError("getLocalImage error:", e);
        }
    }
    showAndroidTips(e) {
        0 == Number(e) && GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.ShowCommToast, { str: GameApp.Interface.GetSystem(I18NSystem).getValueByKey("utlis.compress_tips"), time: 30, sizeType: 0, nomal_direction: ToolUtils.getIsNormalDirection() });
    }
    onFBShareImageAndTextCallBack(e) {
    }
    onWAShareImageAndTextCallBack(e) {
    }
    getFirebaseTokenCallBack(e) {
    }
    getFirebaseJumpTypeCallBack(e) {
    }
    getFirebaseExtCallBack(e) {
    }
    getLocationFromNative(e) {
        try {
            let t = null;
            t = "object" == typeof e ? e : ToolUtils.parseJson(e);
            let i = t.lat + "", r = t.lon + "", o = ReportConfig.func.Login;
            director.getScene().name == BundleNameDefined.hall_scene && (o = ReportConfig.func.Hall);
            "" === i && "" === r ? (ToolUtils.location_forbid = true, HttpManager.shared().doSdkApiReport({ scene: ReportConfig.scece.Hall, func: o, event: ReportConfig.login_evt.location_upload, location_type: 2 })) : (GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.GetLocationSucess), ToolUtils.hasGetLocation = true, ToolUtils.saveData("LOCATION_LATITUDE", i), ToolUtils.saveData("LOCATION_LONGITUDE", r), ToolUtils.latitude = i, ToolUtils.longitude = r, GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.GetLocationStatus), HttpManager.shared().doSdkApiReport({ scene: ReportConfig.scece.Hall, func: o, event: ReportConfig.login_evt.location_upload, location_type: 1, latitude: i, longtitude: r }));
        }
        catch (e) {
            TLog.printError("getLocationFromNative error:", e);
        }
    }
    getLatitude() {
        let t = ToolUtils.latitude;
        return "" == t && this.checkIfOpenLocation() && (t = ToolUtils.isSafeString(sys.localStorage.getItem("LOCATION_LATITUDE"))), t;
    }
    getLongitude() {
        let t = ToolUtils.longitude;
        return "" == t && this.checkIfOpenLocation() && (t = ToolUtils.isSafeString(sys.localStorage.getItem("LOCATION_LONGITUDE"))), t;
    }
    getDeepLinkCdKey() {
        let t = this.getDeepLinkInfo();
        if (String(t).length > 0) {
            let i = t.split("&");
            if (Array.isArray(i) && i.length > 0) {
                let t = {};
                i.forEach((e => {
                    let [i, r] = e.split("=");
                    t[i] = r;
                }));
                let o = t.t, a = t.e;
                if (sys.isObjectValid(o) && 2 == Number(o)) {
                    return this.setDeepLinkInfo(""), ToolUtils.isSafeString(a);
                }
            }
        }
        return "";
    }
    checkDeepLinkMatchId() {
        let t = this.getDeepLinkInfo();
        if (String(t).length > 0) {
            let i = t.split("&");
            if (Array.isArray(i) && i.length > 0) {
                let t = {};
                i.forEach((e => {
                    let [i, r] = e.split("=");
                    t[i] = r;
                }));
                let o = t.reg, a = t.enter;
                sys.isObjectValid(o) && String(o).length > 0 ? (this.setDeepLinkInfo(""), GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.EnterMatchRigestView, Number(o))) : sys.isObjectValid(a) && String(a).length > 0 && (this.setDeepLinkInfo(""), GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.EnterMatchRigestView, Number(a)));
            }
        }
    }
    getNativeLaunch() {
        HttpManager.shared().doSdkApiReport({ scene: ReportConfig.scece.Hall, func: ReportConfig.func.Login, event: ReportConfig.login_evt.nativeLaunch });
    }
    handleSdkErrorCallBack(e) {
        try {
            HttpManager.shared().doSdkApiReport({ scene: ReportConfig.scece.Hall, func: ReportConfig.func.Hall, event: ReportConfig.common.report_sdk_err, sdkErr: e });
        }
        catch (e) {
            TLog.printError("onSdkErrorReport error:", e);
        }
    }
    handlePhonePeErrorCallBack(e) {
        try {
            HttpManager.shared().doPhonePeReport(e);
        }
        catch (e) {
            TLog.printError("handlePhonePeErrorCallBack error:", e);
        }
    }
    getSearchParamValue(e, t) {
        var i = "", r = this.getSearchStr(e), o = new RegExp("(" + t + ")=([^&]*)");
        return o.test(r) && (i = decodeURIComponent(o.exec(r)[2])), i;
    }
    getSearchStr(e) {
        var t = "", i = /\?([^#]*)/;
        return i.test(e) && (t = i.exec(e)[0]), t;
    }
    decodeUrl(e) {
        var t = "?param=", i = e.indexOf("?param="), r = "";
        if (-1 == i) {
            return "";
        }
        var o = e.substring(i + t.length);
        "#" == o.charAt(o.length - 1) && (o = e.substring(i + t.length, e.length - 1));
        this._urlParam = o;
        try {
            r = window.atob(o);
            var a = ToolUtils.gm_xorfunc(r, 16956);
            r = String.fromCharCode.apply(null, new Uint8Array(a));
            r = window.atob(r);
        }
        catch (e) {
            r = "";
        }
        return "?" + r;
    }
    hideFpsInfo() {
        sys.os == sys.OS.WINDOWS || sys.os == sys.OS.OSX || profiler.hideStats();
    }
    getAPKComment() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return "";
        }
        {
            let e = D.method_pre + "getLuckyAPKcomment" + D.method_next;
            this._isProductVer || (e = D.method_pre + "getZeoyAPKcomment" + D.method_next);
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                return null != t && null != t ? t : "";
            }
            catch (e) {
                return TLog.printError("Appinfo.getAPKComment err:", e), "";
            }
        }
    }
    requestPay(e) {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let t = D.method_pre + "requestLuckyPay" + D.method_next;
            this._isProductVer || (t = D.method_pre + "requestZeoyPay" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)V", e);
            }
            catch (e) {
                TLog.printError("requestPay:", e);
            }
        }
    }
    getContactInfo(e, t, i) {
        if (window[e] = t, !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && sys.os === sys.OS.IOS) {
                try {
                    let t = "window." + e + "." + i;
                    native.reflection.callStaticMethod(D.ios_platform, "getContactInfo:", t);
                }
                catch (e) {
                    TLog.printError("getContactInfo:", e);
                }
            }
        }
        else {
            let t = D.method_pre + "getLuckyContactInfo" + D.method_next;
            this._isProductVer || (t = D.method_pre + "getZeoyContactInfo" + D.method_next);
            try {
                let r = "window." + e + "." + i;
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)V", r);
            }
            catch (e) {
                TLog.printError("Appinfo.getContactInfo:", e);
            }
        }
    }
    getContactInfoCallBack(e) {
    }
    getNetworkType() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (!sys.isNative || sys.os !== sys.OS.IOS) {
                let e = "noNetWork";
                return 1 == sys.getNetworkType() ? e = "WIFI" : 2 == sys.getNetworkType() && (e = "Mobile"), e;
            }
            try {
                let e = native.reflection.callStaticMethod(D.ios_platform, "getNetworkType:", "");
                if (e) {
                    return ToolUtils.isSafeString(e);
                }
            }
            catch (e) {
                return TLog.printError("getNetworkType:", e), "";
            }
        }
        else {
            let e = D.method_pre + "getLuckyNetworkType" + D.method_next;
            this._isProductVer || (e = D.method_pre + "getZeoyNetworkType" + D.method_next);
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                return t ? ToolUtils.isSafeString(t) : "";
            }
            catch (e) {
                TLog.printError("Appinfo.getNetworkType:", e);
            }
        }
        return "noNetWork";
    }
    checkPackageInstalled(e) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && (sys.os == sys.OS.IOS || sys.os == sys.OS.OSX)) {
                "com.facebook.katana" == e ? e = "fb" : "com.twitter.android" == e ? e = "twitter" : "com.whatsapp" == e ? e = "whatsapp" : "org.telegram.messenger" != e && "org.telegram.messenger.web" != e || (e = "tg");
                try {
                    let t = native.reflection.callStaticMethod(D.ios_platform, "checkYsryPackageInstalled:", e);
                    if (t) {
                        return t;
                    }
                }
                catch (e) {
                    return TLog.printError("checkYsryPackageInstalled:", e), 0;
                }
            }
        }
        else {
            let t = D.method_pre + "checkLuckyPackageInstalled" + D.method_next;
            this._isProductVer || (t = D.method_pre + "checkZeoyPackageInstalled" + D.method_next);
            try {
                return native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)I", e);
            }
            catch (e) {
                TLog.printError("Appinfo.checkPackageInstalled:", e);
            }
        }
        return 0;
    }
    getAppInstallData(e = false) {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let t = sys.localStorage.getItem("dp_channelId"), i = sys.localStorage.getItem("dp_userId");
            if (ToolUtils.isSafeString(t).length > 0) {
                return e ? { hasInstall: true, channelId: t } : { hasInstall: true, channelId: ToolUtils.isSafeString(i) };
            }
            let o = D.method_pre + "getLuckyInstallInfo" + D.method_next;
            this._isProductVer || (o = D.method_pre + "getZeoyInstallInfo" + D.method_next);
            try {
                let e = native.reflection.callStaticMethod(D.JAVACLASSNAME, o, "()Ljava/lang/String;");
                if (0 === ToolUtils.isSafeString(e).length) {
                    return { hasInstall: false, channelId: "" };
                }
                let t = ToolUtils.parseJson(ToolUtils.isSafeString(e)), i = ToolUtils.isSafeString(t.channelID), r = ToolUtils.isSafeString(t.userID), n = ToolUtils.isSafeString(t.datafrom);
                return ToolUtils.saveData("dp_userId", r), ToolUtils.saveData("dp_datafrom", n), ToolUtils.saveData("dp_channelId", i), { hasInstall: true, channelId: r };
            }
            catch (e) {
                TLog.printError("Appinfo.getAppInstallInfo:", e);
            }
        }
        return { hasInstall: false, channelId: "" };
    }
    getInstallRefer(e = true) {
        return "";
    }
    setInstallLink() {
        let e = HttpManager.shared().getUrl();
        if (0 == e.length) {
            e = (1 == GameConfig.SERVER_DEBUG ? "http://" : "https://") + URLConfig.orginHttp_CurHttpUrl + "/api.php";
        }
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let t = D.method_pre + "setLuckyInstallLink" + D.method_next;
            this._isProductVer || (t = D.method_pre + "setZeoyInstallLink" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)V", e);
            }
            catch (e) {
                TLog.printError("Appinfo.setInstallLink:", e);
            }
        }
    }
    onAppResume() {
        !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS || (GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.onAppResume), HttpManager.shared().doGetLoginAfterPush());
    }
    changeWebViewHeight(e) {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS) && null != e) {
            let t = e > 0 ? e / view.getScaleY() : 0;
            GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.changeWebViewHeight, t);
        }
    }
    getAndroidVersion() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.os == sys.OS.WINDOWS || sys.os == sys.OS.OSX) {
                return 0;
            }
        }
        else {
            let e = D.method_pre + "getAndroidVersion" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I");
                if (t) {
                    return ToolUtils.isSafeNumber(t);
                }
            }
            catch (e) {
                return TLog.printError("getAndroidVersion:", e), 0;
            }
        }
        return 0;
    }
    initApk(e, t) {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS) && ToolUtils.isSafeString(e).length > 0) {
            let i = D.method_pre + "installApk" + D.method_next;
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, i, "(Ljava/lang/String;Ljava/lang/String;)V", e, t);
            }
            catch (e) {
                TLog.printError("getInstallRefer:", e);
            }
        }
    }
    getLocalVersionCode() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (!sys.isNative || sys.os !== sys.OS.IOS && sys.os !== sys.OS.OSX) {
                return "4";
            }
            try {
                return native.reflection.callStaticMethod(D.ios_platform, "getLocalVersionCode:", "");
            }
            catch (e) {
                TLog.printError("getLocalVersionCode:", e);
            }
            return "0";
        }
        {
            let e = D.method_pre + "getLocalVersionCode" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                if (t) {
                    return t;
                }
            }
            catch (e) {
                return TLog.printError("getLocalVersionCode:", e), "0";
            }
        }
    }
    getDeviceLevel() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return "2";
        }
        {
            let e = D.method_pre + "getDeviceLevel" + D.method_next;
            try {
                return native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I");
            }
            catch (e) {
                return TLog.printError("getDeviceLevel:", e), "1";
            }
        }
    }
    getDeviceCpuName() {
        if (this._cpuName.length > 0) {
            return this._cpuName;
        }
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return "unknow";
        }
        {
            let e = D.method_pre + "getCpuName" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                return this._cpuName = t, t;
            }
            catch (e) {
                return TLog.printError("getDeviceCpuName:", e), "unknow";
            }
        }
    }
    getDeviceCpuHz() {
        if (this._cpuHz >= 0) {
            return this._cpuHz;
        }
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return -1;
        }
        {
            let e = D.method_pre + "getCpuHz" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I");
                return this._cpuHz = t, t;
            }
            catch (e) {
                return TLog.printError("getDeviceCpuHz:", e), -1;
            }
        }
    }
    getDeviceMemory() {
        if (this._memorySize >= 0) {
            return this._memorySize;
        }
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return -1;
        }
        {
            let e = D.method_pre + "getMemorySize" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()J");
                return this._memorySize = t, t;
            }
            catch (e) {
                return TLog.printError("getDeviceMemory:", e), -1;
            }
        }
    }
    getAvailueMemory() {
        if (this._avilMemorySize >= 0) {
            return this._avilMemorySize;
        }
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return -1;
        }
        {
            let e = D.method_pre + "getAvailueMemorySize" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()J");
                return this._avilMemorySize = t, t;
            }
            catch (e) {
                return TLog.printError("getAvailueMemory:", e), -1;
            }
        }
    }
    getFacebookAuthorization() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            sys.isNative && (sys.os, sys.OS.IOS);
        }
        else {
            let e = D.method_pre + "getLuckyFacebookAuthorization" + D.method_next;
            this._isProductVer || (e = D.method_pre + "getZeoyFacebookAuthorization" + D.method_next);
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I");
                if (t) {
                    return t;
                }
            }
            catch (e) {
                return TLog.printError("getLuckyFacebookAuthorization:", e), 0;
            }
        }
        return 0;
    }
    setFirebaseUserId(e) {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let t = D.method_pre + "setLuckyFirebaseUserId" + D.method_next;
            this._isProductVer || (t = D.method_pre + "setZeoyFirebaseUserId" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)V", e);
            }
            catch (e) {
                TLog.printError("setLuckyFirebaseUserId:", e);
            }
        }
    }
    setFirebaseUserProperty(e, t) {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let i = D.method_pre + "setLuckyFirebaseUserProperty" + D.method_next;
            this._isProductVer || (i = D.method_pre + "setZeoyFirebaseUserProperty" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, i, "(Ljava/lang/String;Ljava/lang/String;)V", e, t);
            }
            catch (e) {
                TLog.printError("setFirebaseUserProperty:", e);
            }
        }
    }
    hasLaunchScript() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && (sys.os == sys.OS.IOS || sys.os === sys.OS.OSX)) {
                try {
                    native.reflection.callStaticMethod(D.ios_platform, "hasLaunchScript:", "");
                }
                catch (e) {
                    return TLog.printError("hasLaunchScript:", e), "";
                }
            }
        }
        else {
            let e = D.method_pre + "hasLuckyLaunchScript" + D.method_next;
            this._isProductVer || (e = D.method_pre + "hasZeoyLaunchScript" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()V");
            }
            catch (e) {
                TLog.printError("hasLuckyLaunchScript:", e);
            }
        }
    }
    getLaunchTime() {
        if (!sys.isNative || -1 != this._lanuchTime || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            sys.isNative && (sys.os == sys.OS.IOS || (sys.os, sys.OS.OSX));
        }
        else {
            let e = D.method_pre + "getLaunchTime" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()J");
                if (t) {
                    return this._lanuchTime = t, t;
                }
            }
            catch (e) {
                return TLog.printError("getLaunchTime error:", e), 0;
            }
        }
        return 0;
    }
    startGoogleLogin(e, t, i) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            sys.isNative && (sys.os === sys.OS.IOS || (sys.os, sys.OS.OSX));
        }
        else {
            window[e] = t;
            let r = D.method_pre + "doLuckyGoogleLogin" + D.method_next;
            this._isProductVer || (r = D.method_pre + "doZeoyGoogleLogin" + D.method_next);
            try {
                let t = "window." + e + "." + i;
                native.reflection.callStaticMethod(D.JAVACLASSNAME, r, "(Ljava/lang/String;)V", t);
            }
            catch (e) {
                TLog.printError("startGoogleLogin0:", e);
                this.handleSdkErrorCallBack("startGoogleLogin err:" + e.toString());
            }
        }
    }
    logoutGoogleAccount() {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let e = D.method_pre + "logoutFirebaseAuth" + D.method_next;
            this._isProductVer || (e = D.method_pre + "logoutFirebaseAuth" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()V");
            }
            catch (e) {
                TLog.printError("logoutGoogleAccount:", e);
            }
        }
    }
    logoutFacebookAccount() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
                try {
                    native.bridge.sendToNative("ysrylogoutFacebook");
                }
                catch (e) {
                    TLog.printError("logoutFacebook,error:", e);
                }
            }
        }
        else {
            let e = D.method_pre + "LuckyFacebookLogout" + D.method_next;
            this._isProductVer || (e = D.method_pre + "zeoyFacebookLogout" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()V");
            }
            catch (e) {
                TLog.printError("logoutFacebookAccount:", e);
            }
        }
    }
    startAppleLogin(e, t) {
        if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
            try {
                let i = {};
                i.class_name = e;
                i.callbackName = t;
                native.bridge.sendToNative("startYsryAppleLogin", ToolUtils.toJsonString(i));
            }
            catch (e) {
                TLog.printError("startAppleLogin,error:", e);
            }
        }
    }
    getAndroidGpType() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 0;
        }
        {
            let e = D.method_pre + "getGpType" + D.method_next;
            try {
                return native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I");
            }
            catch (e) {
                return TLog.printError("getAndroidGpType:", e), 0;
            }
        }
    }
    getFBOpen() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 1;
        }
        {
            let e = D.method_pre + "getFBOpen" + D.method_next;
            try {
                return native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I");
            }
            catch (e) {
                return TLog.printError("getFBOpen:", e), 1;
            }
        }
    }
    initAdjustSDK(t, i, o) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && sys.os === sys.OS.IOS) {
                try {
                    native.reflection.callStaticMethod(D.ios_platform, "initAdjustSDK:withKey:withGaid:", t, i, o);
                    this._bInitAdjust = true;
                }
                catch (t) {
                    TLog.printError("initAdjustSDK:", t);
                    this._bInitAdjust = false;
                    this.handleSdkErrorCallBack("initAdjustSdk err:" + t.toString());
                }
            }
        }
        else {
            let r = D.method_pre + "luckyInitAdjustSDK" + D.method_next;
            this._isProductVer || (r = D.method_pre + "zeoyInitAdjustSDK" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, r, "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", t, i, o);
                this._bInitAdjust = true;
            }
            catch (t) {
                TLog.printError("initAdjustSDK:", t);
                this._bInitAdjust = false;
                this.handleSdkErrorCallBack("initAdjustSdk err:" + t.toString());
            }
        }
    }
    trackEventByAdjust(t) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && sys.os === sys.OS.IOS) {
                try {
                    native.reflection.callStaticMethod(D.ios_platform, "trackEventByAdjust:", t);
                }
                catch (e) {
                    TLog.printError("trackEventByAdjust:", e);
                }
            }
        }
        else {
            if (Number(this.getLocalVersionCode()) <= 2) {
                return;
            }
            let i = D.method_pre + "trackEventByAdjust" + D.method_next;
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, i, "(Ljava/lang/String;)V", t);
            }
            catch (e) {
                TLog.printError("trackEventByAdjust:", e);
            }
        }
    }
    image2Text(e, t, i, o) {
        if (window[t] = i, sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let i = D.method_pre + "image2Text" + D.method_next;
            try {
                let r = "window." + t + "." + o;
                native.reflection.callStaticMethod(D.JAVACLASSNAME, i, "(Ljava/lang/String;Ljava/lang/String;)V", e, r);
            }
            catch (e) {
                TLog.printError("image2Text:", e);
            }
        }
    }
    decodeQrCode(e) {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let t = D.method_pre + "decodeQrCode" + D.method_next;
            try {
                let i = native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)Ljava/lang/String;", e);
                if (i) {
                    return i;
                }
            }
            catch (e) {
                TLog.printError("decodeQrCode:", e);
            }
        }
        return "";
    }
    getPackgeVersionCode(e) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            sys.isNative && (sys.os == sys.OS.IOS || (sys.os, sys.OS.OSX));
        }
        else {
            let t = D.method_pre + "getPackgeVersionCode" + D.method_next;
            try {
                let i = native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)I", e);
                if (i) {
                    return i;
                }
            }
            catch (e) {
            }
        }
        return 0;
    }
    checkIfOpenLocation() {
        if (!sys.isNative || sys.os !== sys.OS.IOS && sys.os !== sys.OS.OSX) {
            if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
                let t = this.checkOpenLocationService(), i = this.checkOpenLocationPermission();
                return 1 == t && 1 == i ? 1 : 0;
            }
        }
        else {
            try {
                return native.reflection.callStaticMethod(D.ios_platform, "checkOpenLocation:", "");
            }
            catch (e) {
                return 1;
            }
        }
    }
    getIsNewKyc() {
        return Number(this.getLocalVersionCode()) > 3;
    }
    getIsCanOCR() {
        return Number(this.getLocalVersionCode()) < 11;
    }
    openThirdApp(e) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            !sys.isNative || sys.os != sys.OS.IOS && sys.os != sys.OS.OSX || sys.openURL(e);
        }
        else {
            let t = D.method_pre + "openThirdApp" + D.method_next;
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)V", e);
            }
            catch (t) {
                sys.openURL(e);
            }
        }
    }
    receivedCodeListener() {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let e = D.method_pre + "receivedCodeListener" + D.method_next;
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()V");
            }
            catch (e) {
            }
        }
    }
    receivedCodeCallBack(e) {
        !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS || GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.receivedCode, e);
    }
    getPhoneNumberListener() {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let e = D.method_pre + "getPhoneNumberListener" + D.method_next;
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()V");
            }
            catch (e) {
            }
        }
    }
    getPhoneNumberCallBack(e) {
        !sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS || GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.getPhoneNumber, e);
    }
    getDeepLinkInfo() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (!sys.isNative || sys.os !== sys.OS.IOS && sys.os !== sys.OS.OSX) {
                return "";
            }
            try {
                return native.reflection.callStaticMethod(D.ios_platform, "getDeepLinkInfo:", "") || "";
            }
            catch (e) {
                return "";
            }
        }
        else {
            let e = D.method_pre + "getDeepLinkInfo" + D.method_next;
            try {
                return native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
            }
            catch (e) {
                return "";
            }
        }
    }
    setDeepLinkInfo(e) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
                try {
                    native.reflection.callStaticMethod(D.ios_platform, "setDeepLinkInfo:", String(e));
                }
                catch (e) {
                }
            }
        }
        else {
            let t = D.method_pre + "setDeepLinkInfo" + D.method_next;
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)V", e);
            }
            catch (e) {
            }
        }
    }
    getBePowerId() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return "";
        }
        {
            let e = D.method_pre + "getBdid" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                return t = ToolUtils.isSafeString(t), t;
            }
            catch (e) {
                return "";
            }
        }
    }
    showSysAlert(e) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            sys.isNative && (sys.os === sys.OS.IOS || (sys.os, sys.OS.OSX));
        }
        else {
            let t = D.method_pre + "showSysAlert" + D.method_next;
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)V", e);
            }
            catch (e) {
            }
        }
    }
    getSysAlertNativeCallback(e) {
        try {
            0 == Number(e) ? GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.CancleWatchVideo) : 1 == Number(e) && GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.ContinueWatichVideo);
        }
        catch (e) {
            TLog.printError("getLocationFromNative error:", e);
        }
    }
    setMediaVolum(e) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            sys.isNative && (sys.os === sys.OS.IOS || (sys.os, sys.OS.OSX));
        }
        else {
            let t = D.method_pre + "setMediaVolum" + D.method_next;
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(I)V", e);
            }
            catch (e) {
            }
        }
    }
    getMediaVolum() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 0;
        }
        {
            let e = D.method_pre + "getMediaVolum" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I"), i = Number(t);
                return isNaN(i) ? 0 : i;
            }
            catch (e) {
                return 0;
            }
        }
    }
    getMaxMediaVolum() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 0;
        }
        {
            let e = D.method_pre + "getMaxMediaVolum" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I"), i = Number(t);
                return isNaN(i) ? 0 : i;
            }
            catch (e) {
                return 0;
            }
        }
    }
    getSysMediaVolumeCallback(e) {
        try {
            GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.DeviceVolumeChanged, e);
        }
        catch (e) {
            TLog.printError("getSysMediaVolumeCallback error:", e);
        }
    }
    checkGoogleId() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            sys.isNative && (sys.os === sys.OS.IOS || (sys.os, sys.OS.OSX));
        }
        else {
            let e = D.method_pre + "checkLuckyGoogleAdId" + D.method_next;
            this._isProductVer || (e = D.method_pre + "checkZeoyGoogleAdId" + D.method_next);
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()V");
            }
            catch (e) {
                this.handleSdkErrorCallBack("checkGoogleId err:" + e.toString());
            }
        }
    }
    getIsCalendarContractAllow() {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let e = D.method_pre + "getIsCalendarContractAllow" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I"), i = Number(t);
                return isNaN(i) ? 0 : i;
            }
            catch (e) {
            }
        }
        return 1;
    }
    requestCalendarContractAllow() {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let e = D.method_pre + "requestCalendarContractAllow" + D.method_next;
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()V");
            }
            catch (e) {
            }
        }
    }
    setCalendarContract(e, t, i, o, n) {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let r = D.method_pre + "setCalendarContract" + D.method_next;
            try {
                let s = native.reflection.callStaticMethod(D.JAVACLASSNAME, r, "(Ljava/lang/String;Ljava/lang/String;III)Ljava/lang/String;", o, n, e, t, i);
                return s = ToolUtils.isSafeString(s), s;
            }
            catch (e) {
            }
        }
        return "test";
    }
    cancelCalendarContract(e) {
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let t = D.method_pre + "cancelCalendarContract" + D.method_next;
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)V", e);
            }
            catch (e) {
            }
        }
    }
    getCalendarPermissionSuccCallBack(e) {
        GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.OnCalendarPermissionSucc, Number(e));
    }
    isCalendarSupport() {
        return 2000617 != GameConfig.CHANNEL_ID && (this._isProductVer || parseFloat(this.getAppVersionCode()) >= 10);
    }
    exitApp() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            "MOBILE_BROWSER" != sys.platform && "DESKTOP_BROWSER" != sys.platform || window.close();
        }
        else {
            let e = D.method_pre + "luckyLogout" + D.method_next;
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()V");
            }
            catch (e) {
            }
        }
    }

    getRewardedAdNativeCallBack(e) {
        try {
            GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.HideCommLoading);
            "0" == e ? (ToolUtils.ad_bg_enable = SoundManager.shared().bg_enabled, SoundManager.shared().setEnabled(false), ToolUtils.report_link_id = sys.now(), ToolUtils.ad_complete = 0) : "1" == e || ("2" == e ? ToolUtils.ad_complete = 1 : "3" == e && (1 == ToolUtils.ad_complete && (GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.ReqAdReward, { report_scene: ToolUtils.report_scene, report_link_id: ToolUtils.report_link_id }), ToolUtils.ad_complete = 0), ToolUtils.ad_bg_enable != SoundManager.shared().bg_enabled && SoundManager.shared().setEnabled(ToolUtils.ad_bg_enable), GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.ShowSuperLevelUpAlert)));
        }
        catch (e) {
        }
    }
    checkHasPhonePeSdk() {
        let e = 0;
        if (sys.isNative && (sys.os === sys.OS.ANDROID || sys.os === sys.OS.OHOS)) {
            let t = D.method_pre + "hasPhonePeSdk" + D.method_next;
            try {
                e = native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "()I");
            }
            catch (e) {
            }
        }
        return e;
    }
    getIsRunningOnEmulator() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 0;
        }
        {
            let e = D.method_pre + "CheckIsRunningOnEmulator" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I"), r = Number(t);
                return isNaN(r) ? 0 : r;
            }
            catch (e) {
                return 0;
            }
        }
    }
    getHasLightSensor() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 0;
        }
        {
            let e = D.method_pre + "HasLightSensor" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I"), r = Number(t);
                return isNaN(r) ? 0 : r;
            }
            catch (e) {
                return 0;
            }
        }
    }
    getIsPhoneCpu() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 0;
        }
        {
            let e = D.method_pre + "CheckIsPhoneCpu" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I"), r = Number(t);
                return isNaN(r) ? 0 : r;
            }
            catch (e) {
                return 0;
            }
        }
    }
    getIsSupportCameraLedFlash() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 0;
        }
        {
            let e = D.method_pre + "CheckSupportCameraLedFlash" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I"), r = Number(t);
                return isNaN(r) ? 0 : r;
            }
            catch (e) {
                return 0;
            }
        }
    }
    getHasBluetooth() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 0;
        }
        {
            let e = D.method_pre + "HasBluetoothDevice" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I"), r = Number(t);
                return isNaN(r) ? 0 : r;
            }
            catch (e) {
                return 0;
            }
        }
    }
    getHasGPS() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 0;
        }
        {
            let e = D.method_pre + "HasGPSDevice" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I"), r = Number(t);
                return isNaN(r) ? 0 : r;
            }
            catch (e) {
                return 0;
            }
        }
    }
    getBatteryTemperature() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 0;
        }
        {
            let e = D.method_pre + "getBatteryTemperature" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I"), r = Number(t);
                return isNaN(r) ? 0 : r;
            }
            catch (e) {
                return 0;
            }
        }
    }
    getBatteryChargePlug() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return "";
        }
        {
            let e = D.method_pre + "getBatteryChargePlug" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                return t = ToolUtils.isSafeString(t), t;
            }
            catch (e) {
                return "";
            }
        }
    }
    getBatteryPercent() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return "";
        }
        {
            let e = D.method_pre + "getBatteryPercent" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()Ljava/lang/String;");
                return t = ToolUtils.isSafeString(t), t;
            }
            catch (e) {
                return "";
            }
        }
    }
    getBatteryCharging() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            return 0;
        }
        {
            let e = D.method_pre + "CheckBatteryCharging" + D.method_next;
            try {
                let t = native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()I"), r = Number(t);
                return isNaN(r) ? 0 : r;
            }
            catch (e) {
                return 0;
            }
        }
    }
    changeStatusBarVisible(e) {
    }
    setNormalFrameRate() {
    }
    setHighFrameRate() {
    }
    openVibrate() {
        let e = sys.localStorage.getItem("vb_enabled"), t = true;
        if (sys.isObjectValid(e) && (t = "true" === e), t) {
            if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
                if (sys.isNative && sys.os === sys.OS.IOS) {
                    try {
                        native.reflection.callStaticMethod(O.ios_platform, "openVibrate:", "");
                    }
                    catch (e) {
                        return TLog.printError("openVibrate:", e), "";
                    }
                }
            }
            else {
                let e = D.method_pre + "openLuckyVibrate" + D.method_next;
                try {
                    native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()V");
                }
                catch (e) {
                    TLog.printError("openVibrate:", e);
                }
            }
        }
    }
    openVibrateByTime(e) {
        let t = sys.localStorage.getItem("vb_enabled"), r = true;
        if (null != t && null != t && (r = "true" === t), r) {
            if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
                if (sys.isNative && sys.os === sys.OS.IOS) {
                    try {
                        native.reflection.callStaticMethod(O.ios_platform, "openVibrate2:", String(e));
                    }
                    catch (e) {
                        return TLog.printError("openVibrateByTime:", e), "";
                    }
                }
            }
            else {
                let t = D.method_pre + "openLuckyVibrateByTime" + D.method_next;
                try {
                    native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(I)V", e);
                }
                catch (e) {
                    TLog.printError("openVibrateByTime:", e);
                }
            }
        }
    }
    setSoftInputMode(e) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            sys.os == sys.OS.WINDOWS || (sys.os, sys.OS.OSX);
        }
        else {
            let t = D.method_pre + "setLuckySoftInputMode" + D.method_next;
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(I)V", e);
            }
            catch (e) {
                TLog.printError("getInstallRefer:", e);
            }
        }
    }
    setReportHost(e) {
        if (sys.isObjectValid(e) && !(e.length < 7)) {
            if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
                sys.isNative && (sys.os === sys.OS.IOS || (sys.os, sys.OS.OSX));
            }
            else {
                let t = D.method_pre + "setConfRepUrl" + D.method_next;
                try {
                    native.reflection.callStaticMethod(D.JAVACLASSNAME, t, "(Ljava/lang/String;)V", e);
                }
                catch (e) {
                }
            }
        }
    }
    openFileByApp(e, t) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (!sys.isNative || sys.os != sys.OS.IOS && sys.os != sys.OS.OSX) {
                window.open(e, "_blank");
            }
            else {
                try {
                    native.bridge.sendToNative("openFileByApp", e);
                }
                catch (e) {
                    TLog.printError("openFileByApp,error:", e);
                }
            }
        }
        else {
            let r = D.method_pre + "openFileByApp" + D.method_next;
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, r, "(Ljava/lang/String;Ljava/lang/String;)V", e, t);
            }
            catch (e) {
            }
        }
    }
    openApplicationChat(e, t) {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            if (sys.isNative && (sys.os == sys.OS.IOS || sys.os == sys.OS.OSX)) {
                try {
                    native.reflection.callStaticMethod(O.ios_platform, "openApplicationChat:andUrlLink:", e, t);
                }
                catch (e) {
                    sys.openURL(t);
                }
            }
        }
        else {
            let r = D.method_pre + "openApplicationChat" + D.method_next;
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, r, "(Ljava/lang/String;Ljava/lang/String;)V", e, t);
            }
            catch (e) {
                sys.openURL(t);
            }
        }
    }
    disconnectAppleAccount() {
        if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
            try {
                native.bridge.sendToNative("disconnectRsryAppleAccount");
            }
            catch (e) {
                TLog.printError("disconnectAppleAccount,error:", e);
            }
        }
    }
    getIos_idfa() {
        return "";
    }
    openGooglePlayReview() {
        if (!sys.isNative || sys.os !== sys.OS.ANDROID && sys.os !== sys.OS.OHOS) {
            sys.isNative || sys.openURL(URLConfig.googleplay_url);
        }
        else {
            let e = D.method_pre + "openGooglePlayReview" + D.method_next;
            try {
                native.reflection.callStaticMethod(D.JAVACLASSNAME, e, "()V");
            }
            catch (e) {
            }
        }
    }
    openAppstoreReview() {
        if (sys.isNative && sys.os === sys.OS.IOS) {
            try {
                native.bridge.sendToNative("openAppStoreReviewPage");
            }
            catch (e) {
                TLog.printError("openAppStoreReviewPage,error:", e);
            }
        }
        else {
            sys.isNative || sys.openURL(URLConfig.appstore_url);
        }
    }
    installNativeBridge() {
        this._installNativeBridge();
    }

    _installNativeBridge() {
        if (!sys.isNative) return;
        native.bridge.onNative = (t, i) => this._onNativeMessage(t, i);
    }

    _onNativeMessage(t, i) {
        if (ToolUtils.isJsonString(t)) {
            const r = ToolUtils.parseJson(t);
            const o = r.class_name;
            const a = r.method || r.callbackName;
            if (o === "PlatformSystem" || o === "PlatformRuntime") {
                if (a === "onReportFireBaseToken") this.onReportFireBaseToken(i);
                else if (a === "doFaceBookLogic") GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.NativeFBLogin, i);
                else if (a === "AppleLogin") GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.NativeAppleLogin, i);
                return;
            }
            if (o === "LoginScene" || o === "UserInfoPerfabs") {
                if (a === "doFaceBookLogic") GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.NativeFacebookLogin, i);
                else if (a === "AppleLogin") GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.NativeAppleLogin, i);
                return;
            }
            if (o === "Utils" && a === "doFaceBookLogic") {
                GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.NativeFBLogin, i);
                return;
            }
            if (o === "AppInfo" && a === "onReportFireBaseToken") {
                this.onReportFireBaseToken(i);
                return;
            }
        } else if (t === "AppleLogin") {
            GameApp.Interface.GetSystem(GameEventSystem).emit(PushEvent.NativeAppleLogin, i);
        }
    }

}

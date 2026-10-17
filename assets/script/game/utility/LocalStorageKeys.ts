import { sys } from "cc";
import { LoginType } from "../config/StartConfig";

const KEY_LOGIN_TYPE = "logintype";
const KEY_SAVE_PHONE = "save_phoneno";
const KEY_CODE_PHONE = "code_phoneno";
const KEY_CODE_PWD = "code_pwdno";

export class LocalStorageKeys {
    public static getLoginType(): string | null {
        return sys.localStorage.getItem(KEY_LOGIN_TYPE);
    }

    public static setLoginType(type: LoginType | string): void {
        sys.localStorage.setItem(KEY_LOGIN_TYPE, String(type));
    }

    public static getSavedPhone(): string {
        return sys.localStorage.getItem(KEY_SAVE_PHONE) ?? "";
    }

    public static getCodePhone(): string {
        return sys.localStorage.getItem(KEY_CODE_PHONE) ?? "";
    }

    public static getCodePwd(): string {
        return sys.localStorage.getItem(KEY_CODE_PWD) ?? "";
    }

    public static saveOtpSession(phone: string): void {
        sys.localStorage.setItem(KEY_CODE_PHONE, phone);
        sys.localStorage.setItem(KEY_LOGIN_TYPE, LoginType.Otp);
    }
}

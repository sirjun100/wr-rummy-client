import { sys } from "cc";
import { AbstractModel } from "../../../../../script/framework/QFramework";

const KEY_VIBRATION = "vb_enabled";
const KEY_CARD_VOICE = "cv_enabled";

export class SettingsPreferenceModel extends AbstractModel {
    protected OnInit(): void {}

    public getVibrationEnabled(): boolean {
        const v = sys.localStorage.getItem(KEY_VIBRATION);
        return v === null ? true : v === "true";
    }

    public setVibrationEnabled(on: boolean): void {
        sys.localStorage.setItem(KEY_VIBRATION, String(on));
    }

    public getCardVoiceEnabled(): boolean {
        const v = sys.localStorage.getItem(KEY_CARD_VOICE);
        return v === null ? true : v === "true";
    }

    public setCardVoiceEnabled(on: boolean): void {
        sys.localStorage.setItem(KEY_CARD_VOICE, String(on));
    }
}

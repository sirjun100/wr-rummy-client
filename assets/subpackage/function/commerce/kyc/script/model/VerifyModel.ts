import { AbstractModel } from "../../../../../script/framework/QFramework";
import type { PersonBindType } from "../config/VerifyProtocol";

export class VerifyModel extends AbstractModel {
    public activeBindType: PersonBindType = "tel";
    public otpCooldownEnd = 0;
    public lastDevOtp = "";

    protected OnInit(): void {}

    public otpCooldownRemainingSec(nowMs = Date.now()): number {
        const left = Math.ceil((this.otpCooldownEnd - nowMs) / 1000);
        return left > 0 ? left : 0;
    }

    public startOtpCooldown(sec: number): void {
        this.otpCooldownEnd = Date.now() + sec * 1000;
    }
}

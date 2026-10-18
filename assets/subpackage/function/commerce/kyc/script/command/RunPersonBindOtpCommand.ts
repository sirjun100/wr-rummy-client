import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { PaymentRoute } from "../../../../../script/game/commerce/config/PaymentRoute";
import { VerifyOtpCooldownSec, VerifyI18n } from "../config/VerifyConfig";
import type { PersonBindType } from "../config/VerifyProtocol";
import { VerifyModel } from "../model/VerifyModel";

export class RunPersonBindOtpCommand extends AbstractCommand {
    public constructor(private readonly bindType: PersonBindType) {
        super();
    }

    protected OnExecute(): void {
        const model = this.GetModel(VerifyModel);
        if (model.otpCooldownRemainingSec() > 0) {
            return;
        }
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<{ code?: number; otp?: string }>(PaymentRoute.ProfileBindSendOtp, {
                bind_type: this.bindType,
            })
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    this.GetSystem(UISystem).showToast(VerifyI18n.bindOtpFail);
                    return;
                }
                model.startOtpCooldown(VerifyOtpCooldownSec);
                if (res.otp) {
                    model.lastDevOtp = res.otp;
                    LogKit.I("[RunPersonBindOtpCommand] dev otp={0}", res.otp);
                }
                this.GetSystem(UISystem).showToast(VerifyI18n.bindOtpSent);
            })
            .catch((err) => {
                LogKit.W("[RunPersonBindOtpCommand] {0}", err instanceof Error ? err.message : String(err));
                this.GetSystem(UISystem).showToast(VerifyI18n.bindOtpFail);
            });
    }
}

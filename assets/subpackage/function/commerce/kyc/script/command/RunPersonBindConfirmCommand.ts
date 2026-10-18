import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { FetchPaymentProfileCommand } from "../../../../../script/game/commerce/command/FetchPaymentProfileCommand";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { PaymentRoute } from "../../../../../script/game/commerce/config/PaymentRoute";
import { VerifyI18n } from "../config/VerifyConfig";
import type { PersonBindType } from "../config/VerifyProtocol";
import { ProfileBindSuccessEvent } from "../event/ProfileBindSuccessEvent";

export class RunPersonBindConfirmCommand extends AbstractCommand {
    public constructor(
        private readonly bindType: PersonBindType,
        private readonly value: string,
        private readonly code: string,
        private readonly onSuccess?: () => void,
    ) {
        super();
    }

    protected OnExecute(): void {
        const value = this.value.trim();
        const code = this.code.trim();
        if (!value) {
            this.GetSystem(UISystem).showToast(VerifyI18n.bindValueEmpty);
            return;
        }
        if (!code) {
            this.GetSystem(UISystem).showToast(VerifyI18n.bindOtpEmpty);
            return;
        }
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<{ code?: number }>(PaymentRoute.ProfileBindConfirm, {
                bind_type: this.bindType,
                value,
                code,
            })
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    this.GetSystem(UISystem).showToast(VerifyI18n.bindFail);
                    return;
                }
                this.SendCommand(new FetchPaymentProfileCommand());
                this.SendEvent(new ProfileBindSuccessEvent(this.bindType));
                this.GetSystem(UISystem).showToast(VerifyI18n.bindOk);
                this.onSuccess?.();
            })
            .catch((err) => {
                LogKit.W("[RunPersonBindConfirmCommand] {0}", err instanceof Error ? err.message : String(err));
                this.GetSystem(UISystem).showToast(VerifyI18n.bindFail);
            });
    }
}

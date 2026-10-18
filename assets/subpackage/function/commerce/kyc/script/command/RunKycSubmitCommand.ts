import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { SubmitKycCommand } from "../../../../../script/game/commerce/command/SubmitKycCommand";
import { KycUpdatedEvent } from "../../../../../script/game/commerce/event/PaymentEvents";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { VerifyI18n } from "../config/VerifyConfig";

export class RunKycSubmitCommand extends AbstractCommand {
    public constructor(
        private readonly name: string,
        private readonly onSuccess?: () => void,
    ) {
        super();
    }

    protected OnExecute(): void {
        const name = this.name.trim();
        if (!name) {
            this.GetSystem(UISystem).showToast(VerifyI18n.kycSubmitEmpty);
            return;
        }
        const unreg = this.RegisterEvent(KycUpdatedEvent, () => {
            unreg.UnRegister();
            this.GetSystem(UISystem).showToast(VerifyI18n.kycSubmitOk);
            this.onSuccess?.();
        });
        this.SendCommand(new SubmitKycCommand(name));
    }
}

import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { RegisterPaymentPushCommand } from "../../../../../script/game/commerce/command/RegisterPaymentPushCommand";

export class RegisterHallPushCommand extends AbstractCommand {
    protected OnExecute(): void {
        this.SendCommand(new RegisterPaymentPushCommand());
    }
}

import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../system/NetworkSystem";

export class LoginCommand extends AbstractCommand {
    public constructor(
        private readonly account: string,
        private readonly password: string,
    ) {
        super();
    }

    protected OnExecute(): void {
        LogKit.I("[LoginCommand] execute account={0}", this.account);
        const net = this.GetSystem(NetworkSystem);
        net.login(this.account, this.password).catch((err) => {
            LogKit.E("[LoginCommand] {0}", err instanceof Error ? err.message : String(err));
        });
    }
}

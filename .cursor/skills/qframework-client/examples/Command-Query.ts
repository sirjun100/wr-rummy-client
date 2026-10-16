/**
 * Command / Query 模板
 */
import { AbstractCommand, AbstractQuery } from "../../framework/QFramework";

export class DoLoginCommand extends AbstractCommand {
    public constructor(private readonly account: string) {
        super();
    }

    protected OnExecute(): void {
        // const net = this.GetSystem(NetworkSystem);
        // net.login(this.account);
        this.SendEvent(/* LoginSuccessEvent or instance */);
    }
}

export class GetUserDisplayNameQuery extends AbstractQuery<string> {
    protected OnDo(): string {
        // const user = this.GetModel(UserModel);
        // return user.displayName;
        return "";
    }
}

// Controller:
// this.SendCommand(new DoLoginCommand(account));
// const name = this.SendQuery(new GetUserDisplayNameQuery());

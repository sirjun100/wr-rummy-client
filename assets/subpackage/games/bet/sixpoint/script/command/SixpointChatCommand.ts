import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { SixpointRoute } from "../config/SixpointProtocol";
import { callSixpoint } from "../utility/SixpointNetwork";

export class SixpointChatCommand extends AbstractCommand {
    public constructor(private readonly msg: string) {
        super();
    }

    protected OnExecute(): void {
        void callSixpoint(this.GetSystem(NetworkSystem), SixpointRoute.Chat, { msg: this.msg });
    }
}

import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { LobbyTopViewRoute } from "../config/LobbyTopViewConfig";
import { FetchInboxListCommand } from "./FetchInboxListCommand";

export class InboxDeleteCommand extends AbstractCommand {
    constructor(private readonly eid = "") {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<{ code?: number }>(LobbyTopViewRoute.InboxDelete, { eid: this.eid })
            .then(() => {
                this.SendCommand(new FetchInboxListCommand("", false));
            });
    }
}

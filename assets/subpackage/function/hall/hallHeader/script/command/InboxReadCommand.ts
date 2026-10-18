import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { LobbyTopViewRoute } from "../config/LobbyTopViewConfig";
import { LobbyTopViewModel } from "../model/LobbyTopViewModel";
export class InboxReadCommand extends AbstractCommand {
    constructor(private readonly eid: string) {
        super();
    }

    protected OnExecute(): void {
        const model = this.GetModel(LobbyTopViewModel);
        void this.GetSystem(NetworkSystem)
            .callLobby<{ code?: number }>(LobbyTopViewRoute.InboxRead, { eid: this.eid })
            .then(() => {
                model.inboxList.value = model.inboxList.value.map((m) =>
                    m.eid === this.eid ? { ...m, read: 1 } : m,
                );
            });
    }
}

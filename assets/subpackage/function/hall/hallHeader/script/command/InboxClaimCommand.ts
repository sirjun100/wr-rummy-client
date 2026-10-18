import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { FetchWalletSnapshotCommand } from "../../../../../script/game/commerce/command/FetchWalletSnapshotCommand";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { LobbyTopViewRoute } from "../config/LobbyTopViewConfig";
import type { InboxClaimRes } from "../config/LobbyTopViewProtocol";
import { FetchInboxListCommand } from "./FetchInboxListCommand";

export class InboxClaimCommand extends AbstractCommand {
    constructor(private readonly eid = "") {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<InboxClaimRes>(LobbyTopViewRoute.InboxClaim, { eid: this.eid })
            .then((res) => {
                if (res.code === 0 || res.code === undefined) {
                    if (res.wallet) {
                        this.SendCommand(new FetchWalletSnapshotCommand());
                    }
                    const goods = res.data?.goods ?? [];
                    if (goods.length > 0) {
                        globalThis.wrUi?.showToast?.("Rewards collected");
                    }
                    this.SendCommand(new FetchInboxListCommand("", false));
                }
            });
    }
}

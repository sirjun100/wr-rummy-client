import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { LobbyTopViewRoute } from "../config/LobbyTopViewConfig";
import type { InboxListRes } from "../config/LobbyTopViewProtocol";
import { InboxUnreadChangedEvent } from "../event/LobbyTopViewEvents";
import { LobbyTopViewModel } from "../model/LobbyTopViewModel";

export class FetchInboxListCommand extends AbstractCommand {
    constructor(
        private readonly cursor = "",
        private readonly append = false,
    ) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<InboxListRes>(LobbyTopViewRoute.InboxList, { eid: this.cursor })
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[FetchInboxListCommand] code={0}", res.code);
                    return;
                }
                const model = this.GetModel(LobbyTopViewModel);
                const list = res.data?.list ?? [];
                if (this.append) {
                    model.inboxList.value = [...model.inboxList.value, ...list];
                } else {
                    model.inboxList.value = list;
                }
                model.inboxCursor.value = res.data?.eid ?? "";
                this.recomputeUnread(model);
            })
            .catch((err) => {
                LogKit.W("[FetchInboxListCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }

    private recomputeUnread(model: LobbyTopViewModel): void {
        let n = 0;
        for (const m of model.inboxList.value) {
            if (m.read === 0) {
                n++;
            } else if ((m.goods?.length ?? 0) > 0 && m.receive !== 1) {
                n++;
            }
        }
        model.unreadCount.value = n;
        this.SendEvent(new InboxUnreadChangedEvent(n));
    }
}

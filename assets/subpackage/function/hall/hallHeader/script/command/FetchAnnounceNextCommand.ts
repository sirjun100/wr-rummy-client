import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { LobbyTopViewRoute } from "../config/LobbyTopViewConfig";
import type { AnnounceRes } from "../config/LobbyTopViewProtocol";
import { OpenAnnouncementCommand } from "./OpenAnnouncementCommand";
import { OpenUpdateGuideCommand } from "./OpenUpdateGuideCommand";

export class FetchAnnounceNextCommand extends AbstractCommand {
    constructor(private readonly isNext = true) {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<AnnounceRes>(LobbyTopViewRoute.AnnounceNext, {})
            .then((res) => {
                const item = res.item;
                if (!item?.title) {
                    return;
                }
                if (item.kind === "update_guide") {
                    this.SendCommand(new OpenUpdateGuideCommand({ announce: item, isNext: this.isNext }));
                } else {
                    this.SendCommand(new OpenAnnouncementCommand({ announce: item, isNext: this.isNext }));
                }
            })
            .catch((err) => {
                LogKit.W("[FetchAnnounceNextCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

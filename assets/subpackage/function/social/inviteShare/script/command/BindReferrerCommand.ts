import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { ShareRoute } from "../config/ShareConfig";
import type { SharePageRes } from "../config/ShareConfig";

export class BindReferrerCommand extends AbstractCommand {
    public constructor(
        private readonly referrerUid = 0,
        private readonly cdkey = "",
    ) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<SharePageRes>(ShareRoute.BindReferrer, {
                referrer_uid: this.referrerUid,
                cdkey: this.cdkey,
            })
            .catch((err) => {
                LogKit.W("[BindReferrerCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

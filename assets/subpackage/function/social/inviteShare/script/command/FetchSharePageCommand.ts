import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { ShareRoute } from "../config/ShareConfig";
import type { SharePageRes } from "../config/ShareConfig";
import { ShareModel } from "../model/ShareModel";

export class FetchSharePageCommand extends AbstractCommand {
    public constructor(private readonly silent = false) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<SharePageRes>(ShareRoute.SharePage, {})
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    if (!this.silent) {
                        LogKit.W("[FetchSharePageCommand] code={0}", res.code);
                    }
                    return;
                }
                if (res.data) {
                    this.GetModel(ShareModel).page.value = res.data;
                }
            })
            .catch((err) => {
                if (!this.silent) {
                    LogKit.W("[FetchSharePageCommand] {0}", err instanceof Error ? err.message : String(err));
                }
            });
    }
}

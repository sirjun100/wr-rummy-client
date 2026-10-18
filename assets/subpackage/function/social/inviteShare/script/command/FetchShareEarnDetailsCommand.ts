import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { ShareRoute } from "../config/ShareConfig";
import type { EarnDetailsRes } from "../config/ShareConfig";
import { ShareModel } from "../model/ShareModel";

export class FetchShareEarnDetailsCommand extends AbstractCommand {
    public constructor(
        private readonly cpage: number,
        private readonly append = false,
        private readonly onDone?: () => void,
    ) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<EarnDetailsRes>(ShareRoute.EarnDetails, { cpage: this.cpage })
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[FetchShareEarnDetailsCommand] code={0}", res.code);
                    this.onDone?.();
                    return;
                }
                const data = res.data ?? {};
                const model = this.GetModel(ShareModel);
                const prev = model.earnRecords.value;
                const list = data.list ?? [];
                model.earnRecords.value = this.append ? [...prev, ...list] : list;
                model.earnPage.value = data.cpage ?? this.cpage;
                model.earnHasNext.value = data.has_next ?? 0;
                this.onDone?.();
            })
            .catch((err) => {
                LogKit.W("[FetchShareEarnDetailsCommand] {0}", err instanceof Error ? err.message : String(err));
                this.onDone?.();
            });
    }
}

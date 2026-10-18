import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { ShareRoute } from "../config/ShareConfig";
import type { RankListRes } from "../config/ShareConfig";
import { ShareModel } from "../model/ShareModel";

export class FetchShareRankListCommand extends AbstractCommand {
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
            .callLobby<RankListRes>(ShareRoute.RankList, { cpage: this.cpage })
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[FetchShareRankListCommand] code={0}", res.code);
                    this.onDone?.();
                    return;
                }
                const model = this.GetModel(ShareModel);
                const data = res.data ?? {};
                const prev = model.rank.value.rankList.rank_list ?? [];
                const merged = this.append && data.rank_list ? [...prev, ...data.rank_list] : data.rank_list ?? [];
                model.rank.value = {
                    rankList: { ...data, rank_list: merged },
                    page: data.cpage ?? this.cpage,
                };
                this.onDone?.();
            })
            .catch((err) => {
                LogKit.W("[FetchShareRankListCommand] {0}", err instanceof Error ? err.message : String(err));
                this.onDone?.();
            });
    }
}

import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { WalletModel } from "../../../../../script/game/model/WalletModel";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { ShareRoute } from "../config/ShareConfig";
import type { ClaimRewardRes } from "../config/ShareConfig";
import { ShareModel } from "../model/ShareModel";

export class ClaimShareRewardCommand extends AbstractCommand {
    public constructor(
        private readonly rid = "",
        private readonly onDone?: (err: string | null) => void,
    ) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<ClaimRewardRes>(ShareRoute.ClaimReward, { rid: this.rid })
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    this.onDone?.(res.message ?? `code ${res.code}`);
                    return;
                }
                if (res.wallet) {
                    this.GetModel(WalletModel).apply(res.wallet);
                }
                this.GetModel(ShareModel).hasInviteReward.value = 0;
                this.onDone?.(null);
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[ClaimShareRewardCommand] {0}", msg);
                this.onDone?.(msg);
            });
    }
}

import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { WalletModel } from "../../../../../script/game/model/WalletModel";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { ActivityRoute } from "../config/HallConfig";
import type { RedeemCodeReq, RedeemCodeRes } from "../config/HallConfig";

export class RedeemCodeCommand extends AbstractCommand {
    public constructor(
        private readonly cdkey: string,
        private readonly source = 1,
        private readonly onDone?: (errMsg: string | null) => void,
    ) {
        super();
    }

    protected OnExecute(): void {
        const body: RedeemCodeReq = { cdkey: this.cdkey, source: this.source };
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<RedeemCodeRes>(ActivityRoute.RedeemCode, body)
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    this.onDone?.(res.message ?? `code ${res.code}`);
                    return;
                }
                if (res.wallet) {
                    this.GetModel(WalletModel).apply(res.wallet);
                }
                this.onDone?.(null);
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[RedeemCodeCommand] {0}", msg);
                this.onDone?.(msg);
            });
    }
}

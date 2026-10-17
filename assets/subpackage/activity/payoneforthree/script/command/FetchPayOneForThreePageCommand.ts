import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { PayOneForThreePageRes, PayOneForThreeRoute } from "../config/PayOneForThreeConfig";
import { PayOneForThreePageFetchFailedEvent } from "../event/PayOneForThreeEvents";
import { PayOneForThreeModel } from "../model/PayOneForThreeModel";

export class FetchPayOneForThreePageCommand extends AbstractCommand {
    public constructor(private readonly vid: number = 0) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<PayOneForThreePageRes>(PayOneForThreeRoute.Page, { vid: this.vid })
            .then((res) => {
                const page = res.pay_one_for_three_data ?? null;
                if (!page) {
                    this.SendEvent(new PayOneForThreePageFetchFailedEvent("empty page"));
                    return;
                }
                this.GetModel(PayOneForThreeModel).page.value = page;
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[FetchPayOneForThreePageCommand] {0}", msg);
                this.SendEvent(new PayOneForThreePageFetchFailedEvent(msg));
            });
    }
}

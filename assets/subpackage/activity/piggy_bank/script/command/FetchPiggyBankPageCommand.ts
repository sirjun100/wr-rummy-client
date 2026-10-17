import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { PiggyBankPageRes, PiggyBankRoute } from "../config/PiggyBankConfig";
import { PiggyBankPageFetchFailedEvent, PiggyBankPageReadyEvent } from "../event/PiggyBankEvents";
import { PiggyBankModel } from "../model/PiggyBankModel";

export class FetchPiggyBankPageCommand extends AbstractCommand {
    public constructor(private readonly vid: number = 0) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<PiggyBankPageRes>(PiggyBankRoute.Page, { vid: this.vid })
            .then((res) => {
                const page = res.piggy_bank_data ?? null;
                if (!page) {
                    this.SendEvent(new PiggyBankPageFetchFailedEvent("empty page"));
                    return;
                }
                this.GetModel(PiggyBankModel).page.value = page;
                this.SendEvent(new PiggyBankPageReadyEvent(this.vid));
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[FetchPiggyBankPageCommand] {0}", msg);
                this.SendEvent(new PiggyBankPageFetchFailedEvent(msg));
            });
    }
}

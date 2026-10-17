import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { PlatformSystem } from "../../../../../script/game/system/PlatformSystem";
import { PiggyBankPurchaseRes, PiggyBankRoute } from "../config/PiggyBankConfig";
import {
    PiggyBankPurchaseFailedEvent,
    PiggyBankPurchaseSuccessEvent,
} from "../event/PiggyBankEvents";
import { PiggyBankModel } from "../model/PiggyBankModel";

export class StartPiggyBankPurchaseCommand extends AbstractCommand {
    public constructor(private readonly money: number) {
        super();
    }

    protected OnExecute(): void {
        const platform = this.GetSystem(PlatformSystem);
        void platform
            .startPiggyBankPay(this.money)
            .then(() => this.confirmPurchase())
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[StartPiggyBankPurchaseCommand] {0}", msg);
                this.SendEvent(new PiggyBankPurchaseFailedEvent(msg));
            });
    }

    private confirmPurchase(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<PiggyBankPurchaseRes>(PiggyBankRoute.Purchase, {})
            .then((res) => {
                if (res.piggy_bank_data) {
                    this.GetModel(PiggyBankModel).page.value = res.piggy_bank_data;
                }
                this.SendEvent(new PiggyBankPurchaseSuccessEvent(res));
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[StartPiggyBankPurchaseCommand] confirm {0}", msg);
                this.SendEvent(new PiggyBankPurchaseFailedEvent(msg));
            });
    }
}

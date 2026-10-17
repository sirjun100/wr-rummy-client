import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { PlatformSystem } from "../../../../../script/game/system/PlatformSystem";
import { AdvancedGiftRoute } from "../config/AdvancedGiftRoutes";
import { AdvancedGiftPurchaseRes } from "../config/AdvancedGiftTypes";
import { AdvancedGiftFetchFailedEvent } from "../event/AdvancedGiftEvents";
import { AdvancedGiftModel } from "../model/AdvancedGiftModel";

export class StartAdvancedGiftPayCommand extends AbstractCommand {
    public constructor(
        private readonly tierId: number,
        private readonly money: number,
        private readonly reportScene: number,
        private readonly linkId: number,
    ) {
        super();
    }

    protected OnExecute(): void {
        const platform = this.GetSystem(PlatformSystem);
        platform.reportAdvancedPack(this.reportScene, 5, this.linkId, { money: this.money });

        void platform
            .startAdvancedGiftPay(this.money, this.tierId)
            .then(() => this.confirmPurchase())
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[StartAdvancedGiftPayCommand] {0}", msg);
                this.SendEvent(new AdvancedGiftFetchFailedEvent(msg));
            });
    }

    private confirmPurchase(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<AdvancedGiftPurchaseRes>(AdvancedGiftRoute.Purchase, { tier_id: this.tierId })
            .then((res) => {
                const page = res.page;
                if (page) {
                    page.ui_type = 1;
                    this.GetModel(AdvancedGiftModel).page.value = page;
                }
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[StartAdvancedGiftPayCommand] confirm {0}", msg);
                this.SendEvent(new AdvancedGiftFetchFailedEvent(msg));
            });
    }
}

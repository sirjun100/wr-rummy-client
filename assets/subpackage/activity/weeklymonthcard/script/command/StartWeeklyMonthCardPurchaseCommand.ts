import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { PlatformSystem } from "../../../../../script/game/system/PlatformSystem";
import {
    WeeklyMonthCardItemDto,
    WeeklyMonthCardPurchaseRes,
    WeeklyMonthCardRoute,
} from "../config/WeeklyMonthCardConfig";
import { WeeklyMonthCardPurchaseFailedEvent, WeeklyMonthCardPurchaseSuccessEvent } from "../event/WeeklyMonthCardEvents";
import { WeeklyMonthCardModel } from "../model/WeeklyMonthCardModel";

export class StartWeeklyMonthCardPurchaseCommand extends AbstractCommand {
    public constructor(private readonly card: WeeklyMonthCardItemDto) {
        super();
    }

    protected OnExecute(): void {
        const price = Number(this.card.amt ?? 0);
        const cardId = Number(this.card.card_id ?? 0);
        const goodId = Number(this.card.gid ?? 0);
        void this.GetSystem(PlatformSystem)
            .startWeeklyMonthCardPay(price, cardId, goodId)
            .then(() => this.confirmPurchase(price, cardId, goodId))
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                this.SendEvent(new WeeklyMonthCardPurchaseFailedEvent(msg));
            });
    }

    private confirmPurchase(price: number, cardId: number, goodId: number): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<WeeklyMonthCardPurchaseRes>(WeeklyMonthCardRoute.Purchase, {
                card_id: cardId,
                price,
                good_id: goodId,
            })
            .then((res) => {
                const page = res.week_month_card_data ?? null;
                if (page) {
                    this.GetModel(WeeklyMonthCardModel).page.value = page;
                }
                this.SendEvent(
                    new WeeklyMonthCardPurchaseSuccessEvent(res.msg ?? "", res.reward ?? [], page),
                );
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[StartWeeklyMonthCardPurchaseCommand] {0}", msg);
                this.SendEvent(new WeeklyMonthCardPurchaseFailedEvent(msg));
            });
    }
}

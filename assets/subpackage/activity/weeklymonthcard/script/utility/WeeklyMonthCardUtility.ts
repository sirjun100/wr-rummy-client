import { Button, Label, Node } from "cc";
import { IUtility } from "../../../../../script/framework/QFramework";
import { Utility } from "../../../../../script/game/utility/Utility";
import { WeeklyMonthCardItemDto, WeeklyMonthCardPageDto } from "../config/WeeklyMonthCardConfig";

export type WeeklyMonthCardUiRefs = {
    cardNode: Node | null;
    onBuy: (card: WeeklyMonthCardItemDto) => void;
};

export class WeeklyMonthCardUtility implements IUtility {
    public applyPage(refs: WeeklyMonthCardUiRefs, page: WeeklyMonthCardPageDto): void {
        if (!refs.cardNode) {
            return;
        }
        refs.cardNode.active = true;
        const tips = refs.cardNode.getChildByName("tips");
        const tipsLabel = tips?.getComponent(Label);
        if (tipsLabel && page.title_tip) {
            tipsLabel.string = page.title_tip;
        }
        const cards = page.cards ?? [];
        for (let i = 0; i < 3; i++) {
            const cardRoot = refs.cardNode.getChildByName(`card${i}`);
            const item = cards[i];
            if (!cardRoot || !item) {
                continue;
            }
            this.applyCard(cardRoot, item, refs.onBuy);
        }
    }

    public formatValidity(leftday: number): string {
        if (leftday <= 0) {
            return "";
        }
        if (leftday <= 1) {
            return `Validity:${leftday} Day`;
        }
        return `Validity:${leftday} Days`;
    }

    private applyCard(cardRoot: Node, item: WeeklyMonthCardItemDto, onBuy: (card: WeeklyMonthCardItemDto) => void): void {
        const totalGet = cardRoot.getChildByName("total_get")?.getComponent(Label);
        if (totalGet && item.total_amt) {
            totalGet.string = Utility.format.template("₹${0}*", item.total_amt);
        }
        const buyBtn = cardRoot.getChildByName("buy_btn");
        const amtLabel = buyBtn?.getChildByName("amt")?.getComponent(Label);
        if (amtLabel && item.amt != null) {
            amtLabel.string = Utility.format.template("₹${0}", String(item.amt));
        }
        const zhekouLayout = buyBtn?.getChildByName("zhekou_layout");
        const zhekou = zhekouLayout?.getChildByName("zhekou")?.getComponent(Label);
        const flag = buyBtn?.getChildByName("flag");
        if (item.rate) {
            if (zhekou) {
                zhekou.string = String(item.rate);
            }
            if (zhekouLayout) {
                zhekouLayout.active = true;
            }
            if (flag) {
                flag.active = true;
            }
        }
        const loginRoot = cardRoot.getChildByName("login_reward_root");
        const item0 = loginRoot?.getChildByName("item0");
        const item1 = loginRoot?.getChildByName("item1");
        if (item.daily_cash && Number(item.daily_cash) !== 0) {
            const num = item0?.getChildByName("num")?.getComponent(Label);
            if (num) {
                num.string = `₹${item.daily_cash}`;
            }
            if (item0) {
                item0.active = true;
            }
        } else if (item0) {
            item0.active = false;
        }
        if (item.daily_bonus && Number(item.daily_bonus) !== 0) {
            const num = item1?.getChildByName("num")?.getComponent(Label);
            if (num) {
                num.string = `₹${item.daily_bonus}`;
            }
            if (item1) {
                item1.active = true;
            }
        } else if (item1) {
            item1.active = false;
        }
        const validTip = cardRoot.getChildByName("valid_tip")?.getComponent(Label);
        if (validTip) {
            if (item.status && Number(item.status) !== 0) {
                validTip.string = this.formatValidity(Number(item.leftday ?? 0));
            } else {
                validTip.string = "";
            }
        }
        this.applyCardReward(cardRoot.getChildByName("reward_root"), item);
        const btn = buyBtn?.getComponent(Button);
        if (btn) {
            buyBtn.off(Button.EventType.CLICK);
            buyBtn.on(Button.EventType.CLICK, () => onBuy(item), buyBtn);
        }
    }

    private applyCardReward(rewardRoot: Node | null, item: WeeklyMonthCardItemDto): void {
        if (!rewardRoot) {
            return;
        }
        const hasCash = item.get_cash != null && Number(item.get_cash) !== 0;
        const hasBonus = item.get_bonus != null && Number(item.get_bonus) !== 0;
        const r0 = rewardRoot.getChildByName("item0");
        const r1 = rewardRoot.getChildByName("item1");
        if (hasCash && hasBonus) {
            r0?.getChildByName("num")?.getComponent(Label).string = `₹${item.get_cash}`;
            r1?.getChildByName("num")?.getComponent(Label).string = `₹${item.get_bonus}`;
            if (r0) {
                r0.active = true;
            }
            if (r1) {
                r1.active = true;
            }
        } else if (hasBonus) {
            r1?.getChildByName("num")?.getComponent(Label).string = `₹${item.get_bonus}`;
            if (r1) {
                r1.active = true;
            }
            if (r0) {
                r0.active = false;
            }
        } else if (hasCash) {
            r0?.getChildByName("num")?.getComponent(Label).string = `₹${item.get_cash}`;
            if (r0) {
                r0.active = true;
            }
            if (r1) {
                r1.active = false;
            }
        }
    }

}

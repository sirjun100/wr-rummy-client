import {
    Button,
    color,
    Label,
    Layout,
    Node,
    Sprite,
    SpriteFrame,
    UITransform,
    v3,
} from "cc";
import { IUtility } from "../../../../../script/framework/QFramework";
import { Utility } from "../../../../../script/game/utility/Utility";
import {
    PayOneForThreeGoodDto,
    PayOneForThreePageDto,
} from "../config/PayOneForThreeConfig";

export type PayOneForThreeUiRefs = {
    midNode: Node | null;
    bottomNode: Node | null;
    btnSubmit: Node | null;
    bgNode: Node | null;
    btnCloseNode: Node | null;
    topNode: Node | null;
    rechargeNodes: Node[];
    rewBtnBg: SpriteFrame[];
    priceTabbg: SpriteFrame[];
    rewardIcons: SpriteFrame[];
    inRoom: boolean;
    inHall: boolean;
};

export type SubmitButtonMode = "purchase" | "claim" | "tomorrow" | "claimed" | "none";

/** 买一得三子包：价位 tab 与三日奖励绑定（QFramework IUtility）。 */
export class PayOneForThreeUtility implements IUtility {
    public getHaveBuyState(page: PayOneForThreePageDto | null): boolean {
        return Number(page?.have_buy ?? 0) === 1;
    }

    public getGoodList(page: PayOneForThreePageDto | null): PayOneForThreeGoodDto[] {
        const list = page?.good_list;
        return Array.isArray(list) ? list : [];
    }

    public resolveSelectedGood(
        page: PayOneForThreePageDto | null,
        tabIndex: number,
        haveBuy: boolean,
    ): PayOneForThreeGoodDto | null {
        const list = this.getGoodList(page);
        if (!list.length || !page) {
            return null;
        }
        if (haveBuy) {
            const buyPrice = Number(page.buy_price ?? 0);
            for (const g of list) {
                if (Number(g.price ?? 0) === buyPrice) {
                    return g;
                }
            }
            return null;
        }
        if (tabIndex >= 0 && tabIndex < list.length) {
            return list[tabIndex];
        }
        return list[0] ?? null;
    }

    public applyPage(refs: PayOneForThreeUiRefs, page: PayOneForThreePageDto, tabIndex: number): SubmitButtonMode {
        this.setNodePos(refs, page);
        if (!this.getHaveBuyState(page)) {
            this.updatePriceTabUI(refs, page, tabIndex);
        }
        return this.updateBottomUI(refs, page, tabIndex);
    }

    public setNodePos(refs: PayOneForThreeUiRefs, page: PayOneForThreePageDto): void {
        const haveBuy = this.getHaveBuyState(page);
        if (refs.midNode) {
            refs.midNode.active = !haveBuy;
        }
        if (refs.inRoom) {
            return;
        }
        if (refs.midNode) {
            refs.midNode.setPosition(v3(0, 299, 0));
        }
        if (haveBuy) {
            refs.btnCloseNode?.setPosition(v3(318, 459, 0));
            refs.bgNode?.setPosition(v3(0, -95, 0));
            refs.topNode?.setPosition(v3(0, -50, 0));
            refs.bottomNode?.setPosition(v3(0, 41, 0));
        } else {
            refs.btnCloseNode?.setPosition(v3(318, 508, 0));
            refs.bgNode?.setPosition(v3(0, -133, 0));
            refs.topNode?.setPosition(v3(0, 0, 0));
            refs.bottomNode?.setPosition(v3(0, 0, 0));
        }
    }

    public updatePriceTabUI(refs: PayOneForThreeUiRefs, page: PayOneForThreePageDto, tabIndex: number): void {
        if (this.getHaveBuyState(page) || !refs.midNode) {
            return;
        }
        const list = this.getGoodList(page);
        for (let i = 0; i < list.length; i++) {
            const btn = refs.midNode.getChildByName(`btn${i}`);
            if (!btn) {
                continue;
            }
            const selLab = btn.getChildByName("sel_lab")?.getComponent(Label);
            const bg = btn.getChildByName("bg")?.getComponent(Sprite);
            if (selLab) {
                selLab.string = `₹${list[i].price ?? ""}`;
            }
            const selected = tabIndex === i;
            const button = btn.getComponent(Button);
            if (button) {
                button.interactable = !selected;
            }
            if (selLab) {
                selLab.color = selected ? color(255, 237, 87) : color(163, 57, 57);
            }
            if (bg && refs.priceTabbg.length >= 2) {
                bg.spriteFrame = selected ? refs.priceTabbg[1] : refs.priceTabbg[0];
            }
        }
    }

    public updateBottomUI(
        refs: PayOneForThreeUiRefs,
        page: PayOneForThreePageDto,
        tabIndex: number,
    ): SubmitButtonMode {
        const haveBuy = this.getHaveBuyState(page);
        const good = this.resolveSelectedGood(page, tabIndex, haveBuy);
        if (!good?.reward?.length || !refs.btnSubmit) {
            return "none";
        }
        const rewards = good.reward;
        for (let t = 0; t < refs.rechargeNodes.length; t++) {
            const dayReward = rewards.find((r) => Number(r.day ?? 0) === t + 1) ?? rewards[t];
            const itemNode = refs.rechargeNodes[t];
            if (!dayReward || !itemNode) {
                itemNode && (itemNode.active = false);
                continue;
            }
            this.bindDayItem(refs, itemNode, dayReward, t);
        }
        return this.bindSubmitButton(refs, good, haveBuy);
    }

    private bindDayItem(
        refs: PayOneForThreeUiRefs,
        itemNode: Node,
        dayReward: { day?: number; cash?: number; bouns?: number; state?: number },
        slotIndex: number,
    ): void {
        itemNode.active = true;
        const cash = Number(dayReward.cash ?? 0);
        const bonus = Number(dayReward.bouns ?? 0);
        const total = cash + bonus;
        const item0 = itemNode.getChildByName("reward")?.getChildByName("item0");
        const item1 = itemNode.getChildByName("reward")?.getChildByName("item1");
        const add = itemNode.getChildByName("reward")?.getChildByName("add");
        const hasCash = cash > 0;
        const hasBonus = bonus > 0;
        if (item0) {
            item0.active = hasCash;
            if (hasCash) {
                item0.getChildByName("num")?.getComponent(Label)?.string = String(cash);
            }
        }
        if (item1) {
            item1.active = hasBonus;
            if (hasBonus) {
                item1.getChildByName("num")?.getComponent(Label)?.string = String(bonus);
            }
        }
        if (add) {
            add.active = hasCash && hasBonus;
        }
        let iconIdx = -1;
        if (hasCash && hasBonus) {
            iconIdx = 2;
        } else if (hasCash) {
            iconIdx = 0;
        } else if (hasBonus) {
            iconIdx = 1;
        }
        const icon = itemNode.getChildByName("icon")?.getComponent(Sprite);
        if (icon && iconIdx >= 0 && refs.rewardIcons[iconIdx]) {
            icon.spriteFrame = refs.rewardIcons[iconIdx];
        }
        const gou = itemNode.getChildByName("gou");
        if (gou) {
            gou.active = Number(dayReward.state ?? 0) === 2;
        }
        let amountText = hasCash && hasBonus ? `₹${total}*` : `₹${total}`;
        if (refs.inRoom && slotIndex === 0) {
            amountText += "\n";
        } else {
            amountText += " ";
        }
        const tips = itemNode.getChildByName("tips")?.getComponent(Label);
        if (tips) {
            if (slotIndex === 0) {
                tips.string = `GET ${amountText}NOW`;
            } else if (slotIndex === 1) {
                tips.string = refs.inRoom
                    ? `DAY 2\nGET ${amountText}`
                    : `DAY 2 GET ${amountText}`;
            } else {
                tips.string = refs.inRoom
                    ? `DAY 3\nGET ${amountText}`
                    : `DAY 3 GET ${amountText}`;
            }
        }
        if (hasCash && hasBonus) {
            item0?.getComponent(Layout)?.updateLayout();
            item1?.getComponent(Layout)?.updateLayout();
            itemNode.getChildByName("reward")?.getComponent(Layout)?.updateLayout();
            const rewardTf = itemNode.getChildByName("reward")?.getComponent(UITransform);
            const limit = refs.inHall ? 195 : 200;
            if (rewardTf && rewardTf.contentSize.width > limit) {
                itemNode.getChildByName("reward")?.setScale(v3(0.8, 0.8, 1));
            }
        }
    }

    private bindSubmitButton(
        refs: PayOneForThreeUiRefs,
        good: PayOneForThreeGoodDto,
        haveBuy: boolean,
    ): SubmitButtonMode {
        const btn = refs.btnSubmit;
        if (!btn) {
            return "none";
        }
        const cur = btn.getChildByName("price")?.getChildByName("cur")?.getComponent(Label);
        const origin = btn.getChildByName("price")?.getChildByName("origin");
        const flag = btn.getChildByName("flag");
        const sprite = btn.getComponent(Sprite);
        const button = btn.getComponent(Button);
        if (cur) {
            cur.active = true;
        }
        if (button) {
            button.interactable = true;
        }
        if (!haveBuy) {
            if (origin) {
                origin.active = true;
            }
            if (flag) {
                const txt = good.add_ratio_txt ?? "";
                flag.active = txt.length > 0;
                flag.getChildByName("wz")?.getComponent(Label)?.string = txt;
            }
            if (sprite && refs.rewBtnBg[0]) {
                sprite.spriteFrame = refs.rewBtnBg[0];
            }
            if (cur) {
                cur.string = `₹${good.price ?? ""}`;
            }
            origin?.getComponent(Label)?.string = `₹${good.origin_price ?? ""}`;
            return "purchase";
        }
        if (origin) {
            origin.active = false;
        }
        if (flag) {
            flag.active = false;
        }
        if (cur) {
            cur.fontSize = 36;
        }
        const rewards = good.reward ?? [];
        for (let i = 0; i < rewards.length; i++) {
            const r = rewards[i];
            if (Number(r.day) === 3 && Number(r.state) === 2) {
                if (button) {
                    button.interactable = false;
                }
                if (sprite && refs.rewBtnBg[2]) {
                    sprite.spriteFrame = refs.rewBtnBg[2];
                }
                if (cur) {
                    cur.string = "CLAIMED";
                }
                return "claimed";
            }
            if (
                (Number(r.day) === 2 && Number(r.state) === 1) ||
                (Number(r.day) === 3 && Number(r.state) === 1)
            ) {
                if (sprite && refs.rewBtnBg[0]) {
                    sprite.spriteFrame = refs.rewBtnBg[0];
                }
                if (cur) {
                    cur.string = "CLAIM";
                }
                return "claim";
            }
            if (
                (Number(r.day) === 2 && Number(r.state) === 0) ||
                (Number(r.day) === 3 && Number(r.state) === 0)
            ) {
                let t = 0;
                t += Number(r.cash ?? 0);
                t += Number(r.bouns ?? 0);
                if (sprite && refs.rewBtnBg[1]) {
                    sprite.spriteFrame = refs.rewBtnBg[1];
                }
                if (cur) {
                    cur.string = Utility.format.template("Claim tomorrow ({0})", t);
                }
                return "tomorrow";
            }
        }
        return "none";
    }
}

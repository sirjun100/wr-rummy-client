import { IUIData } from "../../../../../script/framework/toolkits/uiKit/UIKit";

/** Act_104 — legacy jump id 104 */
export const WeeklyMonthCardActId = 104;

export const WeeklyMonthCardRoute = {
    Page: 1338,
    Tips: 1339,
    Purchase: 1340,
} as const;

export type WeeklyMonthCardRewardDto = {
    type?: number;
    amt?: string;
    num?: number;
};

export type WeeklyMonthCardItemDto = {
    card_id?: number;
    gid?: number;
    amt?: number;
    total_amt?: string;
    rate?: string;
    daily_cash?: number;
    daily_bonus?: number;
    loginreward_cash?: number;
    loginreward_bonus?: number;
    status?: number;
    leftday?: number;
    get_cash?: number;
    get_bonus?: number;
};

export type WeeklyMonthCardPageDto = {
    title_tip?: string;
    pways?: string;
    cards?: WeeklyMonthCardItemDto[];
    pop_reward?: WeeklyMonthCardRewardDto[];
};

export type WeeklyMonthCardPageRes = {
    code?: number;
    week_month_card_data?: WeeklyMonthCardPageDto;
};

export type WeeklyMonthCardTipsRes = {
    code?: number;
    tips?: string;
};

export type WeeklyMonthCardPurchaseRes = {
    code?: number;
    msg?: string;
    price_tips?: string;
    recharge_id?: string;
    reward?: WeeklyMonthCardRewardDto[];
    week_month_card_data?: WeeklyMonthCardPageDto;
};

export class WeeklyMonthCardOpenData implements IUIData {
    public constructor(
        public readonly vid: number = 0,
        public readonly inRoom: boolean = false,
        public readonly isNext: boolean = false,
        public readonly openAct: number = 1,
    ) {}
}

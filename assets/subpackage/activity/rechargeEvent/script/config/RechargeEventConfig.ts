import { IUIData } from "../../../../../script/framework/toolkits/uiKit/UIKit";

export const RechargeEventRoute = {
    FirstPage: 1326,
    FirstPurchase: 1327,
    RebatePage: 1328,
    RebatePurchase: 1329,
    TwentyFourPage: 1330,
    TwentyFourPurchase: 1331,
    RestartPage: 1332,
    RestartClaim: 1333,
    RestartPurchase: 1334,
    ConsecutivePage: 1335,
    ConsecutivePurchase: 1336,
    CouponPreview: 1337,
} as const;

export type RewardDto = { type?: number; amt?: string; num?: number };

export type GoodTierDto = {
    cash?: number;
    bonus?: number;
    price?: number;
    ratio?: string;
    goodsId?: number;
};

export type FirstRechargePageDto = {
    first_recharge_type?: number;
    time_left?: number;
    sub_title?: string;
    coupon_id?: number;
    recommend_price?: number;
    good_list?: GoodTierDto[];
    purchased_mask?: number;
};

export type RebateRechargePageDto = {
    time_left?: number;
    max?: number;
    coupon_id?: number;
    pways?: string;
    act_status?: number;
    good_list?: GoodTierDto[];
    bought?: number[];
};

export type TwentyFourPageDto = {
    time_left?: number;
    price?: number;
    cash?: number;
    bonus?: number;
    line_cash?: string;
    ratio?: string;
    title?: string;
    goods_id?: number;
    closed?: number;
};

export type CollectItemDto = { tips?: string; amt?: number; iscollect?: number };

export type RestartGiftPageDto = {
    status?: number;
    instant_amount?: number;
    instant_bonus?: number;
    ratio_text?: string;
    tips_text?: string;
    tips_text2?: string;
    collect?: CollectItemDto[];
};

export type ConsecutiveGoodDto = {
    day?: number;
    ratio?: string;
    cash?: number;
    bonus?: number;
    price?: number;
    good_id?: number;
    state?: number;
};

export type ConsecutiveGiftPageDto = {
    time_left?: number;
    extra?: string;
    act_num?: string;
    pways?: string;
    good_list?: ConsecutiveGoodDto[];
};

export type CouponInfoDto = {
    coupon_id?: number;
    rate_text?: string;
    content?: string;
    coupon_code?: string;
    expire_text?: string;
};

export type CouponPackageDto = {
    coupon_info?: CouponInfoDto;
    recommend_price?: number;
};

export class RechargeOpenData implements IUIData {
    public initialExt?: unknown;

    public constructor(
        public readonly vid: number = 0,
        public readonly inRoom: boolean = false,
        public readonly isNext: boolean = false,
        public readonly prefabKey?: string,
        initialExt?: unknown,
    ) {
        this.initialExt = initialExt;
    }
}

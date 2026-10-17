import { IUIData } from "../../../../../script/framework/toolkits/uiKit/UIKit";

export const PayOneForThreeRoute = {
    Page: 1321,
    Claim: 1322,
    Purchase: 1323,
} as const;

export type PayOneForThreeDayRewardDto = {
    day?: number;
    cash?: number;
    bouns?: number;
    state?: number;
};

export type PayOneForThreeGoodDto = {
    price?: number | string;
    origin_price?: number | string;
    good_id?: number | string;
    add_ratio_txt?: string;
    reward?: PayOneForThreeDayRewardDto[];
};

export type PayOneForThreePageDto = {
    have_buy?: number;
    buy_price?: number | string;
    pways?: number | string;
    good_list?: PayOneForThreeGoodDto[];
    idx?: number;
};

export type PayOneForThreePageRes = {
    code?: number;
    pay_one_for_three_data?: PayOneForThreePageDto;
};

export type PayOneForThreeRewardItemDto = {
    type?: number;
    amt?: string;
    num?: number;
};

export type PayOneForThreeClaimRes = {
    code?: number;
    tip?: string;
    msg?: string;
    reward_list?: PayOneForThreeRewardItemDto[];
    pay_one_for_three_data?: PayOneForThreePageDto;
    ext?: PayOneForThreePageDto;
};

export type PayOneForThreePurchaseRes = {
    code?: number;
    pay_one_for_three_data?: PayOneForThreePageDto;
    page?: PayOneForThreePageDto;
};

export class PayOneForThreeOpenData implements IUIData {
    public constructor(
        public readonly vid: number = 0,
        public readonly inRoom: boolean = false,
        public readonly isNext: boolean = false,
        public readonly needReqPage: boolean = true,
        public readonly initialPage: PayOneForThreePageDto | null = null,
        public readonly tabIndex: number = -1,
    ) {}
}

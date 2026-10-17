import { IUIData } from "../../../../../script/framework/toolkits/uiKit/UIKit";

export const PiggyBankRoute = {
    Page: 1324,
    Purchase: 1325,
} as const;

export type PiggyBankTipsDto = {
    bonus?: string[];
    cash?: string[];
    daily?: string[];
    spending?: string[];
    storage?: string[];
};

export type PiggyBankPageDto = {
    status?: number;
    progress?: number;
    max?: number;
    money?: number;
    cash?: number;
    bonus?: number;
    discount_ratio?: string;
    currentDesc?: string;
    reset?: string;
    max_tip?: string;
    club?: number;
    tips?: PiggyBankTipsDto;
    act_68_open?: number;
    full_status?: number;
};

export type PiggyBankPageRes = {
    code?: number;
    piggy_bank_data?: PiggyBankPageDto;
};

export type PiggyBankRewardDto = {
    type?: number;
    amt?: string;
    num?: number;
};

export type PiggyBankPurchaseRes = {
    code?: number;
    msg?: string;
    price_tips?: string;
    recharge_id?: string;
    reward?: PiggyBankRewardDto[];
    piggy_bank_data?: PiggyBankPageDto;
};

export class PiggyBankOpenData implements IUIData {
    public constructor(
        public readonly vid: number = 0,
        public readonly inRoom: boolean = false,
        public readonly isNext: boolean = false,
    ) {}
}

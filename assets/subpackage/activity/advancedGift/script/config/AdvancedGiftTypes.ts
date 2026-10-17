import { IUIData } from "../../../../../script/framework/toolkits/uiKit/UIKit";

export type AdvancedGiftTierDto = {
    id: number;
    money: number;
    bmoney: number;
    bonus: number;
    add: number;
    all: string;
    jackpot: number;
    status: number;
};

export type AdvancedGiftPageDto = {
    reset: number;
    title: string;
    rule: string;
    buyID: number;
    version: string;
    list: AdvancedGiftTierDto[];
    ui_type?: number;
};

export type AdvancedGiftRewardDto = {
    cash?: number;
    bonus?: number;
};

export type AdvancedGiftPageRes = AdvancedGiftPageDto & { code?: number };

export type AdvancedGiftClaimRes = {
    code?: number;
    reward?: AdvancedGiftRewardDto;
    tips?: string;
    page?: AdvancedGiftPageDto;
};

export type AdvancedGiftPurchaseRes = {
    code?: number;
    page?: AdvancedGiftPageDto;
};

export class AdvancedGiftOpenData implements IUIData {
    public constructor(
        public readonly reportScene: number = 1,
        public readonly popSource: number = 0,
        public readonly linkId: number = 0,
        public readonly isNext: boolean = false,
        public readonly seedPage: AdvancedGiftPageDto | null = null,
    ) {}
}

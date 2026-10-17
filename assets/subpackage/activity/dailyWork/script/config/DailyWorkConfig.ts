import { IUIData } from "../../../../../script/framework/toolkits/uiKit/UIKit";

export const DailyWorkRoute = {
    Page: 1306,
    Claim: 1307,
} as const;

export type DailyWorkLoginTaskDto = {
    tid?: number;
    st?: number;
    up?: string;
    rnum?: number;
    rtype?: number;
};

export type DailyWorkPlayTaskDto = {
    tid?: number;
    st?: number;
    cnt?: string;
    percent?: number;
    rnum?: number;
    rtype?: number;
};

export type DailyWorkChargeTaskDto = {
    tid?: number;
    st?: number;
    up?: string;
    tprice?: number[];
    rnum?: number;
    rtype?: number;
};

export type DailyWorkPageDto = {
    lefttime?: number;
    rule?: string;
    login_t?: DailyWorkLoginTaskDto[];
    play_t?: DailyWorkPlayTaskDto[];
    charge_t?: DailyWorkChargeTaskDto;
};

export type DailyWorkPageRes = {
    code?: number;
    back_card_task_data?: DailyWorkPageDto;
};

export type DailyWorkTaskRewardDto = {
    tid?: number;
    rnum?: number;
    rtype?: number;
};

export type DailyWorkRewardItemDto = {
    type?: number;
    num?: number;
};

export type DailyWorkClaimRes = {
    code?: number;
    tip?: string;
    msg?: string;
    treward?: DailyWorkTaskRewardDto[];
    reward?: DailyWorkRewardItemDto[];
    page?: DailyWorkPageDto;
};

export class DailyWorkOpenData implements IUIData {
    public constructor(
        public readonly reportScene: number = 1,
        public readonly popSource: number = 0,
        public readonly linkId: number = 0,
        public readonly isNext: boolean = false,
    ) {}
}

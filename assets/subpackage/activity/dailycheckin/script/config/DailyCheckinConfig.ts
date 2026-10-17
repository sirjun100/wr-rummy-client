import { IUIData } from "../../../../../script/framework/toolkits/uiKit/UIKit";

export const DailyCheckinRoute = {
    Page: 1304,
    Claim: 1305,
} as const;

export type DailyCheckinRewardItemDto = {
    type?: number;
    num?: number;
};

export type DailyCheckinDayRewardDto = {
    rewards?: DailyCheckinRewardItemDto[];
};

export type DailyCheckinPageDto = {
    day?: number;
    status?: number;
    ctype?: number;
    every_reward?: DailyCheckinDayRewardDto[];
};

export type DailyCheckinPageRes = {
    code?: number;
    daily_login_act_data?: DailyCheckinPageDto;
};

export type DailyCheckinClaimRes = {
    code?: number;
    tip?: string;
    page?: DailyCheckinPageDto;
};

export class DailyCheckinOpenData implements IUIData {
    public constructor(
        public readonly reportScene: number = 1,
        public readonly popSource: number = 0,
        public readonly linkId: number = 0,
        public readonly isNext: boolean = false,
    ) {}
}

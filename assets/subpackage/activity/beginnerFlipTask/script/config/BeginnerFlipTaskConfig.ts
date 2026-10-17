import { IUIData } from "../../../../../script/framework/toolkits/uiKit/UIKit";

export const BeginnerFlipTaskRoute = {
    Page: 1310,
    Records: 1311,
    ClaimFlip: 1312,
    CheckReward: 1313,
} as const;

export type BeginnerFlipRewardDto = {
    cash?: number;
    bonus?: number;
    icon?: string;
    icon_id?: number;
    is_get?: number;
};

export type BeginnerFlipJumpDto = {
    htype?: number;
    game?: number;
    data?: {
        player?: number;
        mode?: number;
        pool_game?: number;
        deals?: number;
    };
};

export type BeginnerFlipPageDto = {
    time_left?: number;
    today_task_status?: number;
    current_play_num?: number;
    target_play_num?: number;
    max_reward?: number;
    is_last_day?: number;
    reward?: BeginnerFlipRewardDto[];
    jump?: BeginnerFlipJumpDto;
    task_id?: number;
};

export type BeginnerFlipRecordItemDto = {
    reward_time?: string;
    play_num?: number;
    cash?: number;
    bonus?: number;
};

export type BeginnerFlipPageRes = {
    code?: number;
    flop_cash_task_data?: BeginnerFlipPageDto;
};

export type BeginnerFlipRecordsRes = {
    code?: number;
    reward_list?: BeginnerFlipRecordItemDto[];
};

export type BeginnerFlipClaimRes = {
    code?: number;
    reward_data?: BeginnerFlipRewardDto;
    reward_list?: BeginnerFlipRecordItemDto[];
    next_play_num?: number;
    task_data?: BeginnerFlipPageDto;
};

export type BeginnerFlipCheckRes = {
    code?: number;
    show?: number;
    task_id?: number;
    task_data?: BeginnerFlipPageDto;
};

export class BeginnerFlipTaskOpenData implements IUIData {
    public constructor(
        public readonly reportScene: number = 1,
        public readonly popSource: number = 0,
        public readonly linkId: number = 0,
        public readonly isNext: boolean = false,
    ) {}
}

export class BeginnerFlipGameOpenData implements IUIData {
    public constructor(
        public readonly source: BeginnerFlipPageDto | null = null,
        public readonly vid: string = "",
        public readonly tidKey: string = "",
    ) {}
}

export class BeginnerFlipRecordOpenData implements IUIData {
    public constructor() {}
}

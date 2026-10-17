import { IUIData } from "../../../../../script/framework/toolkits/uiKit/UIKit";

export const NewPlayerTaskRoute = {
    Page: 1319,
    Claim: 1320,
} as const;

export type NewPlayerTaskRewardDto = {
    type?: number;
    amt?: string;
    num?: number;
};

export type NewPlayerTaskJumpInfoDto = {
    type?: number;
    exe?: unknown;
};

export type NewPlayerTaskItemDto = {
    task_status?: number;
    type?: number;
    sub_type?: number;
    sub_title?: string;
    num?: number;
    total?: number;
    task_id?: number;
    sub_task_id?: number;
    reward?: NewPlayerTaskRewardDto[];
    jump_info?: NewPlayerTaskJumpInfoDto;
};

export type NewPlayerTaskActiveDto = {
    amt?: number;
    reward?: NewPlayerTaskRewardDto[];
};

export type NewPlayerTaskProgressDto = {
    red_dot?: number;
    task_status?: number;
    sub_type?: number;
    num?: number;
    total?: number;
};

export type NewPlayerTaskPageDto = {
    left_second?: number;
    rule?: string;
    active_num?: number;
    task?: NewPlayerTaskItemDto[];
    active?: NewPlayerTaskActiveDto[];
    show?: number;
    progress?: NewPlayerTaskProgressDto;
};

export type NewPlayerTaskPageRes = {
    code?: number;
    new_player_task_data?: NewPlayerTaskPageDto;
};

export type NewPlayerTaskClaimRes = {
    code?: number;
    tip?: string;
    msg?: string;
    reward_list?: NewPlayerTaskRewardDto[];
    page?: NewPlayerTaskPageDto;
};

export class NewPlayerTaskOpenData implements IUIData {
    public constructor(
        public readonly vid: number = 0,
        public readonly inRoom: boolean = false,
        public readonly isNext: boolean = false,
    ) {}
}

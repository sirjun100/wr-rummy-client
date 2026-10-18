import type { RankRowDto } from "../../../tableChrome/roomLeaderboard/script/config/GameActLeaderboardProtocol";

export type { RankRowDto };

export type HallFaqDto = { q?: string; a?: string };

export type HallMainDto = {
    cycle_sn?: number;
    entry_status?: number;
    auto_entry_status?: number;
    challenger_open?: number;
    main_pic?: string;
    faq?: HallFaqDto[];
    pending_reward_pop?: number;
};

export type HallSelectItemDto = {
    key?: string;
    value?: string;
    is_live?: number;
};

export type HallMiniTabDto = {
    left_time?: number;
    total_reward?: string;
    select_item?: HallSelectItemDto[];
};

export type HallRankDetailDto = {
    type?: string;
    cycle_sn?: number;
    entry_status?: number;
    entry_tips?: string;
    cycle_tips?: string;
    issued_reward?: string;
    mini_tab?: HallMiniTabDto;
    page?: number;
    has_next_page?: number;
    my_rank_info?: RankRowDto;
    rank_list?: RankRowDto[];
    pass_reward_list?: { start_time?: string; end_time?: string; total_reward?: string }[];
};

export type HallBoardListDto = {
    type?: string;
    page?: number;
    has_next_page?: number;
    my_rank_info?: RankRowDto;
    rank_list?: RankRowDto[];
};

export type HallScheduleDto = {
    top_tips?: string;
    start_day?: string;
    end_day?: string;
    total_reward?: string;
    schedule?: { day?: string; time?: string; reward?: string }[];
    reward_list?: { show_range_time?: string; total_reward?: string; is_live?: number }[];
};

export type HallLobbyRes<T> = {
    code?: number;
    data?: T;
};

export type RankingsPopActData = {
    time_str?: string;
    total_reward?: string;
    total_reward_num?: string;
    entry_status?: number;
    auto_entry_status?: number;
    mega_rank?: { bmoney?: string }[];
    jump_info?: { lobby?: number; game?: number; player?: number };
    isNext?: boolean;
};

export type RankingsEndTipData = {
    has_reward?: number;
    rank?: number;
    reward?: string;
    tips?: string;
    distance_reward_rank?: number;
    isNext?: boolean;
};

export type RankingsOptinData = {
    status?: number;
    total_reward_num?: string;
    jump_info?: { lobby?: number; game?: number; player?: number };
    auto_entry_status?: number;
};

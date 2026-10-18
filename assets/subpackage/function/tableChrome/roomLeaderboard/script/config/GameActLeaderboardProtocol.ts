export type RankRowDto = {
    rank?: number;
    name?: string;
    points?: number;
    bmoney?: string;
    avatar?: string;
    is_me?: number;
    up_rank?: number;
};

export type RoomChallengerPageDto = {
    show?: number;
    entry_status?: number;
    total_reward?: string;
    ratio?: string;
    cycle_tips?: string;
    left_time?: number;
    hour_left_time?: number;
    daily_left_time?: number;
    mega_left_time?: number;
    hour_reward?: string;
    day_reward?: string;
    page?: number;
    has_next_page?: number;
    my_rank_info?: RankRowDto;
    rank_list?: RankRowDto[];
};

export type ProgressItemDto = {
    progress_rate?: number;
    incr_points?: number;
    end_icon?: number;
    is_completed?: number;
};

export type RoomChallengerPageRes = {
    code?: number;
    data?: RoomChallengerPageDto;
};

export type OptEntryRes = {
    code?: number;
    data?: { status?: number };
};

export type RoomProgressRes = {
    code?: number;
    data?: { list?: ProgressItemDto[] };
};

export class GameActLeaderboardOpenData {
    public constructor(
        public vid = 0,
        public tidKey = "",
    ) {}
}

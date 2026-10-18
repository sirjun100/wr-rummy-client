/** Act_131 / bet.cricket Due routes (6021–6066). */
export const CricketRoute = {
    Enter: 6021,
    Leave: 6022,
    MatchList: 6031,
    MyMatchList: 6032,
    AllContestList: 6033,
    MyContestList: 6034,
    LeaderboardInContest: 6035,
    WinningsInContest: 6036,
    PreJoinCheck: 6037,
    CreateTeam: 6038,
    UpdateTeam: 6039,
    UpdateBackupTeam: 6040,
    CreateTeamCheck: 6041,
    TeamList: 6042,
    JoinTeamList: 6043,
    PlayerInfo: 6044,
    SwitchTeamList: 6045,
    SwitchTeam: 6046,
    BestTeam: 6047,
    StatTeam: 6048,
    TeamRecentMatch: 6049,
    PkTeamRecentMatch: 6050,
    CheckJoinTeamList: 6051,
    SignContest: 6052,
    EndTopInfo: 6053,
    EndMyContests: 6054,
    EndPlayerStats: 6055,
    EndScoreboard: 6056,
    EndLeaderboard: 6057,
    EndWinnings: 6058,
    EndPlayerDetail: 6059,
    EndSortParam: 6060,
    BackupPlayerList: 6061,
    LeaderboardTeam: 6062,
    CompareTeam: 6063,
    MoneyLess: 6064,
    ChipLess: 6065,
    MatchPush: 6066,
} as const;

export type CricketRes<T> = { code?: number; data?: T };

export type CricketEnterDto = {
    cricket_open?: number;
    balance?: number;
    backup_open?: number;
};

export type CricketMatchListDto = {
    list?: Record<string, unknown>[];
    has_next_page?: number;
    page?: number;
    act_131_dot_ids?: number[];
};

export type CricketContestListDto = {
    list?: Record<string, unknown>[];
    has_next_page?: number;
    page?: number;
};

export type CricketPlayerTpl = {
    player_id: number;
    name: string;
    role: string;
    team: string;
    credit: number;
};

export type CricketCreateTeamCheckDto = {
    player_list?: CricketPlayerTpl[];
    credit_cap?: number;
    squad_size?: number;
};

export type CricketUserTeamDto = {
    team_id: number;
    match_id: number;
    player_ids: number[];
    captain_id: number;
    vice_captain_id: number;
    backup_ids?: number[];
    team_name?: string;
    total_credit?: number;
};

export type CricketTeamListDto = {
    list?: CricketUserTeamDto[];
    count?: number;
};

export type CricketSignResultDto = {
    contest_id?: number;
    team_id?: number;
    msg?: string;
};

export type CricketOpenData = {
    match_id?: number;
    contest_id?: number;
    team_id?: number;
};

export type CricketMatchItemDto = {
    match_id?: number;
    title?: string;
    status?: string;
    start_time_unix?: number;
    team_a?: string;
    team_b?: string;
    format?: string;
    venue?: string;
    force?: number;
    contest?: Record<string, unknown>;
};

export type CricketContestItemDto = {
    contest_id?: number;
    name?: string;
    entry_fee?: number;
    prize_pool?: number;
    max_spots?: number;
    filled_spots?: number;
    match_id?: number;
    team_id?: number;
};

export type CricketLeaderboardDto = {
    list?: Record<string, unknown>[];
};

export type CricketEndTopInfoDto = {
    match_id?: number;
    title?: string;
    status?: string;
    team_a?: string;
    team_b?: string;
};

export type CricketMoneyLessDto = {
    show_recharge?: number;
    tips?: string;
};

export type CricketDeepLinkData = {
    match_id?: number;
    o_uid?: number;
};

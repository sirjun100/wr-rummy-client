/** Due bet.crash routes (6001-6009). Legacy field names match old RocketGameCmd payloads. */
export const RocketRoute = {
    EnterHall: 6001,
    LeaveHall: 6002,
    SyncTable: 6003,
    Bet: 6004,
    CancelBet: 6005,
    ChangeBet: 6006,
    CashOut: 6007,
    TablePush: 6008,
    PlayersPage: 6009,
} as const;

/** Server push `kind` → old SM handler mapping */
export const RocketPushKind = {
    NotifyBet: "notify_bet",
    NotifyFly: "notify_fly",
    RollResult: "roll_result",
    SomeoneCashOut: "notify_someone_cash_out",
    SomeoneBet: "notify_someone_bet",
    UpdateTimeBet: "update_time_bet",
    OnlineCount: "online_players_count",
    JpPoolAmount: "jp_pool_amount",
} as const;

export type RocketPushKindValue = (typeof RocketPushKind)[keyof typeof RocketPushKind];

export interface RocketRes<T = unknown> {
    code?: number;
    data?: T;
    fly?: Record<string, unknown>;
    jackpot?: { ret?: number; last_times?: number; list?: unknown[] };
    ret?: number;
    tid_key?: string;
    bt_state?: number[];
    money?: number;
    win_rate?: number;
    win_score?: number;
    color?: number;
    pop_addgold?: number;
    cur_bet?: number;
    ext?: Record<string, unknown>;
}

export interface RocketTableDto {
    tid_key?: string;
    state?: number;
    cd?: number;
    total_cd?: number;
    money?: number;
    cur_bet?: number[];
    selfbet?: number[];
    bet_config?: number[];
    bet_rate_config_add?: number[];
    bet_rate_config_reduce?: number[];
    history_record?: { win_rate?: string; color?: number }[];
    autoplay_st?: number[];
    autoplay_cfg?: { round?: number; auto_out?: number }[];
    bt_state?: number[];
    fly_time?: number;
    win_rate?: number;
    jackpot_pool?: number;
    max_fly_time?: number;
    rocket_in_jp?: number;
    ext?: Record<string, unknown>;
}

export interface RocketPushPayload {
    kind?: string;
    tid_key?: string;
    state?: number;
    cd?: number;
    total_cd?: number;
    win_rate?: number;
    times?: number;
    count?: number;
    jackpot_pool?: number;
    bt_state?: number[];
    ext?: Record<string, unknown>;
    money?: number;
    color?: number;
    index?: number;
    bet?: number;
    win_score?: number;
    name?: string;
}

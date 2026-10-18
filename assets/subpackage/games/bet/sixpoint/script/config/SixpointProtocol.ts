/** Due bet.sixpoint routes (6071-6088). Legacy field names match old SixPointCmd payloads. */
export const SixpointRoute = {
    EnterHall: 6071,
    LeaveHall: 6072,
    SyncTable: 6073,
    Bet: 6074,
    RepeatBet: 6075,
    ChangeBet: 6076,
    SitDown: 6077,
    StandUp: 6078,
    History: 6079,
    PlayersPage: 6080,
    GoldRecord: 6081,
    Chat: 6082,
    Face: 6083,
    Emotion: 6084,
    TablePush: 6088,
} as const;

export const SixpointPushKind = {
    NotifyBet: "notify_bet",
    NotifyCommitRest: "notify_commit_rest",
    PerSecondBetInfo: "per_second_bet_info",
    BetBc: "bet_bc",
    RollResult: "roll_result",
    OnlineCount: "online_players_count",
    SitDownBc: "sit_down_bc",
    StandUpBc: "stand_up_bc",
    ChatBc: "chat_bc",
    FaceBc: "face_bc",
    EmotionBc: "emotion_bc",
} as const;

export interface SixpointRes<T = unknown> {
    code?: number;
    data?: T;
    ret?: number;
    tid_key?: string;
    money?: number;
    pop_addgold?: number;
    err_msg?: string;
    option?: number;
    allbet?: number;
    selfbet?: number;
    bet?: number;
    cur_bet?: number;
    betAreaInfo?: BetAreaInfo[];
    seatid?: number;
}

export interface BetAreaInfo {
    option?: number;
    allbet?: number;
    selfbet?: number;
    multiple?: number;
    chip_info?: { value?: number; num?: number }[];
}

export interface SixpointTableDto {
    tid_key?: string;
    state?: number;
    cd?: number;
    money?: number;
    bet_config?: number[];
    cur_bet?: number;
    seatid?: number;
    uid?: number;
    gold_limit?: number;
    sit_down_money?: number;
    speakerminmoney?: number;
    rich_players?: Record<string, unknown>[];
    betAreaInfo?: BetAreaInfo[];
    history_record?: number[][];
    act_98_show?: number;
    times?: number;
    reward_value?: number;
    ad_multiple?: number;
}

export interface SixpointPushPayload {
    kind?: string;
    tid_key?: string;
    state?: number;
    cd?: number;
    count?: number;
    betAreaInfo?: BetAreaInfo[];
    diceinfo?: number[];
    pointinfo?: number[];
    win_op?: number[];
    win_multiple?: number[];
    money?: number;
    winscore?: number;
    other_win?: number;
    uid?: number;
    seatid?: number;
    option?: number;
    allbet?: number;
    bet?: number;
    msg?: string;
    rich_players?: Record<string, unknown>[];
    face_id?: number;
    emotion_id?: number;
}

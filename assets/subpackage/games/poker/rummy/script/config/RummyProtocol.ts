/** Due card.rummy routes (node-room). */
export const RummyRoute = {
    CreateRoom: 2001,
    JoinRoom: 2002,
    LeaveRoom: 2003,
    StartRoom: 2004,
    Play: 3001,
    SyncRoom: 3002,
    MyCards: 3003,
    TablePush: 3004,
    DeclareCheck: 3005,
} as const;

export const MatchRoute = {
    Enqueue: 1201,
    Cancel: 1202,
    Status: 1203,
} as const;

export const RummyPushKind = {
    TableInfo: "table_info",
    GameStart: "game_start",
    PickBc: "pick_bc",
    DiscardBc: "discard_bc",
    GameEnd: "game_end",
    NotifyTurn: "notify_turn",
    MyCards: "my_cards",
} as const;

export type RummyPlayAction = "draw_closed" | "draw_open" | "discard" | "declare" | "drop";

export interface RummyCardDto {
    id: number;
    rank: number;
    suit: number;
    printed_joker?: boolean;
}

export interface RummyPlayerView {
    uid: number;
    seat: number;
    dropped?: boolean;
    eliminated?: boolean;
}

export interface RummyTablePushPayload {
    kind?: string;
    tid_key?: string;
    room_id?: number;
    format?: string;
    phase?: string;
    hand_no?: number;
    turn_uid?: number;
    wild_rank?: number;
    open_top?: RummyCardDto;
    players?: RummyPlayerView[];
    pool_scores?: Record<string, number>;
    chips?: Record<string, number>;
    cd?: number;
    uid?: number;
    from?: string;
    card?: RummyCardDto;
    winner?: number;
    penalties?: Record<string, number>;
    cards?: RummyCardDto[];
}

export interface RummyPublicView {
    room_id: number;
    format: string;
    phase: string;
    hand_no: number;
    turn_uid: number;
    wild_rank: number;
    open_top?: RummyCardDto;
    players: RummyPlayerView[];
    pool_scores?: Record<string, number>;
    chips?: Record<string, number>;
}

export interface RummyRes<T = unknown> {
    code?: number;
    data?: T;
    ret?: number;
    money?: number;
    pop_addgold?: number;
    err_msg?: string;
    ok?: boolean;
}

export interface RummyCreateRoomData {
    room_id: number;
}

export interface RummyMatchStatusData {
    status?: string;
    table_id?: number;
    game_id?: string;
}

/** Lobby vid → Due template_id (extend in rooms.json on server). */
export const RummyVidTemplate: Record<number, string> = {
    1: "points_10",
    2: "pool_101",
    3: "pool_201",
    4: "deals_6",
};

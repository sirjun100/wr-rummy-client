import type { WalletSnapshotDto } from "../../../../../script/game/model/WalletModel";

/** Lobby hall support routes (1000–1099 segment). */
export const HallRoute = {
    Logout: 1007,
    HallBootstrap: 1008,
    /** See lobby `LobbyRoute.HallHome` — fetched on lobby enter. */
    HallHome: 1025,
    HallRoomCatalog: 1033,
    FaqPage: 1009,
    FeedbackSubmit: 1010,
} as const;

export const ActivityRoute = {
    RedeemCode: 1341,
} as const;

export type HallPingbiDto = {
    redeemcode?: number;
    store?: number;
    club?: number;
    withdraw?: number;
    invite?: number;
};

export type HallPlayerClubDto = {
    club_level?: number;
    club_name?: string;
    club_score?: number;
    left_second?: number;
};

export type HallPlayerDto = {
    uid?: number;
    name?: string;
    avatar?: string;
    avatar_url?: string;
    hall_invite_earn?: string;
    has_invite_reward?: number;
    /** Equipped table cloth skin id (not game table instance id). */
    table_id?: number;
    table_face_id?: number;
    table_back_id?: number;
    is_new_rank?: number;
    challenger_open?: number;
    player_club?: HallPlayerClubDto;
};

export type HallHelpDto = {
    privacy_url?: string;
    tc_url?: string;
    responsible_url?: string;
};

export type RummyRuleFlagsDto = {
    points_mode?: number;
    multiple_rummy_open?: number;
    bump_rummy_open?: number;
    double_6_open?: number;
    chip_multiple_rummy_open?: number;
    chip_bump_rummy_open?: number;
    chip_double_6_open?: number;
};

export type HallConfigDto = {
    chips_model?: number;
    pingbi?: HallPingbiDto;
    rummy_rules?: RummyRuleFlagsDto;
};

export type SupportChannelsDto = {
    email?: string;
    whatsapp?: string;
    telegram?: string;
    feedback_url?: string;
    support_enabled?: number;
};

export type HallBootstrapRes = {
    code?: number;
    player?: HallPlayerDto;
    config?: HallConfigDto;
    help?: HallHelpDto;
    support?: SupportChannelsDto;
};

export type FaqCategoryDto = {
    id?: string;
    title?: string;
    items?: { q?: string; a?: string }[];
};

export type FaqPageRes = {
    code?: number;
    categories?: FaqCategoryDto[];
};

export type FeedbackSubmitReq = {
    scene?: string;
    content?: string;
    contact?: string;
};

export type CodeRes = { code?: number };

export type RedeemCodeReq = {
    cdkey?: string;
    source?: number;
};

export type RedeemCodeRes = {
    code?: number;
    message?: string;
    wallet?: WalletSnapshotDto;
};

export type BalancePushDto = {
    code?: number;
    wallet?: WalletSnapshotDto;
};

import type { WalletSnapshotDto } from "../../../../../script/game/model/WalletModel";

/** Lobby invite/share routes (1011–1020). */
export const ShareRoute = {
    SharePage: 1011,
    RankList: 1012,
    EarnDetails: 1013,
    IncomeList: 1014,
    ClaimReward: 1015,
    AwardPop: 1016,
    TaskPop: 1017,
    TaskDetail: 1018,
    BindReferrer: 1019,
    Stat: 1020,
} as const;

export const InvitePushRoute = {
    RewardFlag: 1431,
} as const;

export type SharePageDto = {
    share_url?: string;
    share_text?: string;
    carousel?: string[];
    total_cash?: number;
    total_bonus?: number;
    work_steps?: { title?: string; desc?: string }[];
    cash_share_text?: string;
    match_share_text?: string;
    rules?: string;
};

export type RankEntryDto = {
    rank?: number;
    name?: string;
    avatar?: string;
    cash?: number;
    bonus?: number;
    invite_num?: number;
};

export type RankUserDataDto = {
    rank?: number;
    name?: string;
    avatar?: string;
    cash?: number;
    bonus?: number;
    invite_num?: number;
};

export type RankListDto = {
    cpage?: number;
    has_next?: number;
    rank_list?: RankEntryDto[];
    user_share_data?: RankUserDataDto;
};

export type EarnRecordDto = {
    name?: string;
    date?: string;
    reason?: string;
    cash?: number;
    bonus?: number;
};

export type EarnDetailsDto = {
    cpage?: number;
    has_next?: number;
    list?: EarnRecordDto[];
};

export type SharePopDto = {
    share_url?: string;
    share_text?: string;
    title?: string;
    body?: string;
    isNext?: boolean;
    extra?: Record<string, unknown>;
};

export type SharePageRes = { code?: number; data?: SharePageDto };
export type RankListRes = { code?: number; data?: RankListDto };
export type EarnDetailsRes = { code?: number; data?: EarnDetailsDto };
export type SharePopRes = { code?: number; data?: SharePopDto; message?: string };
export type ShareStatRes = {
    code?: number;
    data?: { has_invite_reward?: number; pending_count?: number };
};
export type ClaimRewardRes = {
    code?: number;
    message?: string;
    reward_list?: Record<string, unknown>[];
    wallet?: WalletSnapshotDto;
};

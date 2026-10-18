export type PlayerClubDto = {
    club_level?: number;
    club_name?: string;
    club_score?: number;
    left_second?: number;
};

export type ClubTierDto = {
    level_id?: number;
    name?: string;
    init_score?: number;
    full_score?: number;
    protect_score?: number;
    upgrade_cash?: number;
    upgrade_bonus?: number;
    week_cash?: number;
    week_bonus?: number;
    month_cash?: number;
    month_bonus?: number;
    month_coupon_ratio?: string;
    specialized_cs?: number;
    tx_count?: number;
    tx_limit?: number;
};

export type ClubPageDto = {
    list?: ClubTierDto[];
    player_club_info?: PlayerClubDto;
    point_sp?: string;
    pool_sp?: string;
    deals_sp?: string;
    cricket_sp?: string;
    help_cnt?: string;
};

export type ClubPageRes = { code?: number; data?: ClubPageDto };

export type UpgradePopDto = {
    cash?: number;
    bonus?: number;
    flop_tidkey?: string;
};

export type MembershipClubPushDto = {
    code?: number;
    player_club?: PlayerClubDto;
    upgrade?: UpgradePopDto;
};

export type MembershipSummaryDto = {
    level?: number;
    withdraw_count?: number;
    daily_withdraw?: number;
    next_level_need?: number;
};

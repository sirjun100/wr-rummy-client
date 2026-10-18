export type MailGoodsDto = {
    gtype?: number;
    type?: number;
    num?: number;
    desc?: string;
    discount?: number;
};

export type MailItemDto = {
    eid: string;
    title?: string;
    content?: string;
    read?: number;
    receive?: number;
    time?: number;
    goods?: MailGoodsDto[];
};

export type InboxListDto = {
    eid?: string;
    list?: MailItemDto[];
};

export type InboxListRes = {
    code?: number;
    data?: InboxListDto;
};

export type InboxClaimRes = {
    code?: number;
    data?: { goods?: MailGoodsDto[] };
    wallet?: import("../../../../../script/game/model/WalletModel").WalletSnapshotDto;
};

export type AnnounceDto = {
    id?: string;
    kind?: "announcement" | "update_guide" | string;
    title?: string;
    content?: string;
};

export type AnnounceRes = {
    code?: number;
    item?: AnnounceDto;
};

export type TournamentDetailDto = {
    id?: number;
    name?: string;
    fee?: number;
    status?: number;
    start_time?: number;
    player_count?: number;
    overview?: string;
    prizes?: { rank: number; reward: string }[];
    ranks?: { rank: number; name: string; score: number }[];
};

export type TournamentDetailRes = {
    code?: number;
    data?: TournamentDetailDto;
};

export type OpenMatchDetailsData = {
    tournamentId: number;
};

export type OpenAnnouncementData = {
    announce: AnnounceDto;
    isNext?: boolean;
};

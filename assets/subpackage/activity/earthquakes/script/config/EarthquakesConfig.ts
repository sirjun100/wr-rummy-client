import { IUIData } from "../../../../../script/framework/toolkits/uiKit/UIKit";

export const EarthquakesRoute = {
    Page: 1314,
    Task: 1315,
    Rank: 1316,
    ChipClaim: 1317,
    ChipCheck: 1318,
} as const;

export type EarthquakesRewardDto = {
    type?: number;
    amt?: string;
    num?: number;
};

export type EarthquakesTaskItemDto = {
    tc?: string;
    st?: number;
    reward?: EarthquakesRewardDto[];
    icon?: string;
};

export type EarthquakesTaskDto = {
    list?: EarthquakesTaskItemDto[];
    cju?: number;
    tju?: number;
};

export type EarthquakesVidRoomDto = {
    vid?: number;
    point?: string;
    entry?: number;
    mode?: number;
    flag?: number;
    max_coin?: number;
    vids?: { vid?: number; mode?: number; flag?: number }[];
};

export type EarthquakesPageDto = {
    open?: number;
    rule?: string;
    tip?: string;
    ropen?: number;
    cpool?: number;
    cdeals?: number;
    cvid?: number;
    cplayer?: number;
    ctask?: EarthquakesTaskDto;
    p2?: EarthquakesVidRoomDto[];
    p6?: EarthquakesVidRoomDto[];
    pool_p2?: EarthquakesVidRoomDto[];
    pool_p6?: EarthquakesVidRoomDto[];
    deals_p2?: EarthquakesVidRoomDto[];
    deals_p6?: EarthquakesVidRoomDto[];
    tp?: EarthquakesVidRoomDto[];
    ab?: EarthquakesVidRoomDto[];
};

export type EarthquakesPageRes = {
    code?: number;
    treasure_hunt_data?: EarthquakesPageDto;
};

export type EarthquakesTaskRes = {
    code?: number;
    task?: EarthquakesTaskDto;
};

export type EarthquakesRankEntryDto = {
    rank?: number;
    name?: string;
    score?: number;
    award?: string;
};

export type EarthquakesRankDto = {
    rank_list?: EarthquakesRankEntryDto[];
    my_rank_info?: EarthquakesRankEntryDto;
};

export type EarthquakesRankRes = {
    code?: number;
    rank?: EarthquakesRankDto;
};

export type EarthquakesChipClaimRes = {
    code?: number;
    tip?: string;
    msg?: string;
    reward?: EarthquakesRewardDto[];
    task?: EarthquakesTaskDto;
};

export type EarthquakesChipCheckRes = {
    code?: number;
    can_claim?: number;
    vid?: number;
    player?: number;
    task?: EarthquakesTaskDto;
};

export type EarthquakesQuery = {
    vid?: number;
    in_room?: number;
    player?: number;
    chip?: number;
    rank_mode?: number;
};

export class EarthquakesOpenData implements IUIData {
    public constructor(
        public readonly reportScene: number = 1,
        public readonly linkId: number = 0,
        public readonly chip: 0 | 1 = 0,
        public readonly inRoom: boolean = false,
        public readonly vid: number = 0,
        public readonly player: number = 6,
        public readonly game: number = 0,
        public readonly popSource: number = 0,
    ) {}
}

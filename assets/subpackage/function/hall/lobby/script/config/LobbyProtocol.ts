export type ActCollectItemDto = {
    act_id: number;
    imgurl?: string;
    sort?: number;
    ext?: Record<string, unknown>;
};

export type ActCollectOpenDto = {
    list?: ActCollectItemDto[];
    tab_act?: ActCollectItemDto;
};

export type PlayCollectItemDto = {
    act_id: number;
    sort?: number;
};

export type PlayCollectOpenDto = {
    list?: PlayCollectItemDto[];
};

export type BannerDto = {
    imgurl: string;
    jump_act_id?: number;
};

export type TableInProgressDto = {
    tid_key?: string;
    game_type?: number;
    title?: string;
};

export type HallHomeDto = {
    show_sgame?: number;
    act_collect_open?: ActCollectOpenDto;
    play_collect_open?: PlayCollectOpenDto;
    banner?: BannerDto[];
    act_list_open?: Record<string, number>;
    hall_red_list?: Record<string, number>;
    promotions_red?: number;
    un_read_email?: number;
    mall_label?: number;
    act_76_show?: number;
    act_131_show?: number;
    act_68_open?: number;
    tables_in_progress?: TableInProgressDto[];
};

export type HallHomeRes = {
    code?: number;
    data?: HallHomeDto;
};

export type HallHomeReq = {
    is_back_to_hall?: number;
    vid?: number;
};

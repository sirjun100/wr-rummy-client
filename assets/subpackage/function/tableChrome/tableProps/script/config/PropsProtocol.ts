/** DTOs aligned with modules/props/domain (lobby 1021–1022). */

export type PropsEquippedDto = {
    table_id?: number;
    table_face_id?: number;
    table_back_id?: number;
};

export type PropsEquippedProfileDto = {
    name?: string;
    avatar_id?: number;
    avatar?: string;
    avatar_url?: string;
};

export type PropsItemDto = {
    id?: number;
    category?: string;
    name?: string;
    owned?: number;
};

export type PropsPageDto = {
    equipped?: PropsEquippedDto;
    equipped_profile?: PropsEquippedProfileDto;
    table_items?: PropsItemDto[];
    face_items?: PropsItemDto[];
    back_items?: PropsItemDto[];
    avatar_items?: PropsItemDto[];
    table_red_dot?: number;
};

export type PropsPageRes = {
    code?: number;
    message?: string;
    data?: PropsPageDto;
};

export type PropsApplyReq = {
    table_id?: number;
    table_face_id?: number;
    table_back_id?: number;
    name?: string;
    avatar_id?: number;
};

export type PropsApplyResultDto = {
    equipped?: PropsEquippedDto;
    equipped_profile?: PropsEquippedProfileDto;
};

export type PropsApplyRes = {
    code?: number;
    message?: string;
    data?: PropsApplyResultDto;
};

export type PropsCodeRes = {
    code?: number;
    message?: string;
};

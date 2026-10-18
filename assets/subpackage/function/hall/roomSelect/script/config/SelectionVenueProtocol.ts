import type { SelectionGameType, SelectionRummyType } from "./SelectionVenueConfig";

export type RoomCatalogEntryDto = {
    vid?: number;
    template_id?: string;
    player?: number;
    pool_game?: number;
    deals?: number;
    mode?: number;
    boot?: number;
    entry?: number;
    min_money?: number;
    max_money?: number;
};

export type RoomCatalogListsDto = {
    crashlist?: RoomCatalogEntryDto[];
    privatelist?: RoomCatalogEntryDto[];
    chiplist?: RoomCatalogEntryDto[];
};

export type RoomCatalogVersionsDto = {
    pointsrummy_v?: number;
    poolrummy_v?: number;
    dealsrummy_v?: number;
    multiplerummy_v?: number;
    lobby_list_v?: number;
};

export type RoomCatalogDto = RoomCatalogVersionsDto & {
    pointsrummy?: RoomCatalogListsDto;
    poolrummy?: RoomCatalogListsDto;
    dealsrummy?: RoomCatalogListsDto;
    multiplerummy?: RoomCatalogListsDto;
    lobby_list?: unknown[];
    refresh_room_ver?: string;
    recommend?: number[];
};

export type FetchRoomCatalogReq = RoomCatalogVersionsDto & {
    force_refresh?: number;
};

export type FetchRoomCatalogRes = {
    code?: number;
    data?: RoomCatalogDto;
};

export type SelectionVenueOpenData = {
    gameType?: SelectionGameType;
    rummyType?: SelectionRummyType;
    players?: number;
    poolGame?: number;
    deals?: number;
    mode?: number;
};

export type SelectionUiState = {
    gameType: SelectionGameType;
    rummyType: SelectionRummyType;
    selectPlayers: number;
    selectPool: number;
    selectDeals: number;
    selectMode: number;
    roomIndex: number;
};

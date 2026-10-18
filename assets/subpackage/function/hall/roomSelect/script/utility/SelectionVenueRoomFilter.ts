import { SelectionGameType, SelectionRummyType } from "../config/SelectionVenueConfig";
import type { RoomCatalogDto, RoomCatalogEntryDto, RoomCatalogListsDto } from "../config/SelectionVenueProtocol";

function listKey(rummyType: SelectionRummyType): "pointsrummy" | "poolrummy" | "dealsrummy" | "multiplerummy" {
    switch (rummyType) {
        case SelectionRummyType.Pool:
            return "poolrummy";
        case SelectionRummyType.Deals:
            return "dealsrummy";
        case SelectionRummyType.Multiple:
            return "multiplerummy";
        default:
            return "pointsrummy";
    }
}

function pickList(gameType: SelectionGameType, lists: RoomCatalogListsDto | undefined): RoomCatalogEntryDto[] {
    if (!lists) {
        return [];
    }
    if (gameType === SelectionGameType.Buddy) {
        return lists.privatelist ?? [];
    }
    if (gameType === SelectionGameType.Practice) {
        return lists.chiplist?.length ? lists.chiplist : lists.crashlist ?? [];
    }
    return lists.crashlist ?? [];
}

export function getCurRoomList(catalog: RoomCatalogDto, gameType: SelectionGameType, rummyType: SelectionRummyType): RoomCatalogEntryDto[] {
    const key = listKey(rummyType);
    const block = catalog[key];
    return pickList(gameType, block);
}

export function filterSelectRoomList(
    catalog: RoomCatalogDto,
    gameType: SelectionGameType,
    rummyType: SelectionRummyType,
    players: number,
    poolGame: number,
    deals: number,
    mode: number,
    flags: { bump2?: boolean; bump6?: boolean; multiple2?: boolean; multiple6?: boolean; double6?: boolean },
): RoomCatalogEntryDto[] {
    const base = getCurRoomList(catalog, gameType, rummyType);
    const out: RoomCatalogEntryDto[] = [];
    for (const row of base) {
        if (rummyType === SelectionRummyType.Pool) {
            if (row.player === players && row.pool_game === poolGame) {
                out.push(row);
            }
            continue;
        }
        if (rummyType === SelectionRummyType.Deals) {
            if (row.player === players && row.deals === deals) {
                out.push(row);
            }
            continue;
        }
        const rowMode = row.mode ?? 1;
        if (row.player !== players) {
            continue;
        }
        if (gameType !== SelectionGameType.Cash && gameType !== SelectionGameType.Practice) {
            out.push(row);
            continue;
        }
        if (rowMode === 4 && !(flags.bump2 || flags.bump6)) {
            continue;
        }
        if (rowMode === 3 && !(flags.multiple2 || flags.multiple6)) {
            continue;
        }
        if (rowMode === 5 && !flags.double6) {
            continue;
        }
        if (rowMode === mode || rowMode === 1) {
            out.push(row);
        }
    }
    return out.length ? out : base.filter((r) => r.player === players);
}

export function recommendRoomIndex(rooms: RoomCatalogEntryDto[], balance: number): number {
    if (!rooms.length) {
        return 0;
    }
    for (let i = 0; i < rooms.length; i++) {
        const e = rooms[i];
        const min = Number(e.min_money ?? e.entry ?? 0);
        const max = Number(e.max_money ?? Number.MAX_SAFE_INTEGER);
        if (balance >= min && balance < max) {
            return i;
        }
    }
    return 0;
}

import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import {
    SelectionGameType,
    SelectionRummyType,
} from "../config/SelectionVenueConfig";
import type {
    RoomCatalogDto,
    RoomCatalogEntryDto,
    RoomCatalogVersionsDto,
    SelectionUiState,
    SelectionVenueOpenData,
} from "../config/SelectionVenueProtocol";

const defaultUi: SelectionUiState = {
    gameType: SelectionGameType.Cash,
    rummyType: SelectionRummyType.Points,
    selectPlayers: 6,
    selectPool: 101,
    selectDeals: 6,
    selectMode: 1,
    roomIndex: 0,
};

export class SelectionVenueModel extends AbstractModel {
    public readonly catalog = new BindableProperty<RoomCatalogDto>({});
    public readonly ui = new BindableProperty<SelectionUiState>({ ...defaultUi });
    public readonly filteredRooms = new BindableProperty<RoomCatalogEntryDto[]>([]);
    public readonly ready = new BindableProperty(false);

    protected OnInit(): void {}

    public getVersions(): RoomCatalogVersionsDto {
        const c = this.catalog.value;
        return {
            pointsrummy_v: c.pointsrummy_v ?? -1,
            poolrummy_v: c.poolrummy_v ?? -1,
            dealsrummy_v: c.dealsrummy_v ?? -1,
            multiplerummy_v: c.multiplerummy_v ?? -1,
            lobby_list_v: c.lobby_list_v ?? -1,
        };
    }

    public mergeCatalog(patch: RoomCatalogDto): void {
        const prev = this.catalog.value;
        const next: RoomCatalogDto = { ...prev, ...patch };
        if (patch.pointsrummy) {
            next.pointsrummy = patch.pointsrummy;
        }
        if (patch.poolrummy) {
            next.poolrummy = patch.poolrummy;
        }
        if (patch.dealsrummy) {
            next.dealsrummy = patch.dealsrummy;
        }
        if (patch.multiplerummy) {
            next.multiplerummy = patch.multiplerummy;
        }
        this.catalog.value = next;
        this.ready.value = Boolean(next.pointsrummy?.crashlist?.length);
    }

    public applyOpenData(data: SelectionVenueOpenData): void {
        const cur = this.ui.value;
        this.ui.value = {
            ...cur,
            gameType: data.gameType ?? cur.gameType,
            rummyType: data.rummyType ?? cur.rummyType,
            selectPlayers: data.players ?? cur.selectPlayers,
            selectPool: data.poolGame ?? cur.selectPool,
            selectDeals: data.deals ?? cur.selectDeals,
            selectMode: data.mode ?? cur.selectMode,
        };
    }

    public resetUi(): void {
        this.ui.value = { ...defaultUi };
    }
}

import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import type { HallHomeDto } from "../config/LobbyProtocol";

const emptyHome: HallHomeDto = {};

export class LobbyModel extends AbstractModel {
    readonly home = new BindableProperty<HallHomeDto>(emptyHome);
    readonly selectedTab = new BindableProperty<number>(2);
    readonly gameEntryActIds = new BindableProperty<number[]>([]);
    lastFetchAt = 0;

    protected OnInit(): void {}
}

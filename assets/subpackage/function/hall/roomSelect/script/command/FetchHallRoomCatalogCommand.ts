import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { HallRoute } from "../../hallMenu/script/config/HallConfig";
import type { FetchRoomCatalogReq, FetchRoomCatalogRes } from "../config/SelectionVenueProtocol";
import { SelectionVenueModel } from "../model/SelectionVenueModel";
import { loadCatalogFromStorage, saveCatalogToStorage } from "../utility/SelectionVenueUiHelper";
import { ensureSelectionVenueRegistered } from "../SelectionVenueModule";

export class FetchHallRoomCatalogCommand extends AbstractCommand {
    constructor(private readonly forceRefresh = false) {
        super();
    }

    protected OnExecute(): void {
        ensureSelectionVenueRegistered();
        const model = this.GetModel(SelectionVenueModel);
        const cached = loadCatalogFromStorage();
        if (cached && !model.ready.value) {
            model.mergeCatalog(cached);
        }
        const versions = model.getVersions();
        const req: FetchRoomCatalogReq = {
            ...versions,
            force_refresh: this.forceRefresh ? 1 : 0,
        };
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<FetchRoomCatalogRes>(HallRoute.HallRoomCatalog, req)
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[FetchHallRoomCatalogCommand] code={0}", res.code);
                    return;
                }
                if (res.data) {
                    model.mergeCatalog(res.data);
                    saveCatalogToStorage(model.catalog.value);
                }
            })
            .catch((err) => {
                LogKit.W("[FetchHallRoomCatalogCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}

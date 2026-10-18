import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { EnterSubGameCommand } from "../../../../../script/game/command/EnterSubGameCommand";
import { SubGameId } from "../../../../../script/game/config/BundleManifest";
import { GameplayContextModel } from "../../../../../script/game/model/GameplayContextModel";
import { UISystem } from "../../../../../script/game/system/UISystem";
import type { RoomCatalogEntryDto } from "../config/SelectionVenueProtocol";
import { RummySelectionDialog } from "../ui/RummySelectionDialog";

const TEMPLATE_BY_VID: Record<number, string> = {
    1: "points_10",
    2: "pool_101",
    3: "pool_201",
    4: "deals_6",
};

export class EnterRummyFromSelectionCommand extends AbstractCommand {
    constructor(private readonly entry: RoomCatalogEntryDto) {
        super();
    }

    protected OnExecute(): void {
        const vid = Number(this.entry.vid ?? 1);
        const templateId = this.entry.template_id || TEMPLATE_BY_VID[vid] || "points_10";
        const ctx = this.GetModel(GameplayContextModel);
        ctx.templateId = templateId;
        ctx.subGameId = SubGameId.Rummy;
        void import("../../../../games/poker/rummy/script/RummyGameModule")
            .then((m) => {
                m.ensureRummyRegistered();
                return import("../../../../games/poker/rummy/script/model/RummyModel");
            })
            .then((sm) => {
                if (sm) {
                    const model = this.GetModel(sm.RummyModel);
                    model.vid = vid;
                    model.templateId = templateId;
                }
            })
            .catch(() => undefined);
        this.GetSystem(UISystem).closeDialog(RummySelectionDialog);
        this.SendCommand(new EnterSubGameCommand(SubGameId.Rummy));
    }
}

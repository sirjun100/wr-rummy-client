import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import type { SelectionVenueOpenData } from "../config/SelectionVenueProtocol";
import { FetchHallRoomCatalogCommand } from "./FetchHallRoomCatalogCommand";
import { SelectionVenueModel } from "../model/SelectionVenueModel";
import { RummySelectionDialog } from "../ui/RummySelectionDialog";
import { ensureSelectionVenueRegistered } from "../SelectionVenueModule";

export class OpenRummySelectionCommand extends AbstractCommand {
    constructor(private readonly openData: SelectionVenueOpenData = {}) {
        super();
    }

    protected OnExecute(): void {
        ensureSelectionVenueRegistered();
        const model = this.GetModel(SelectionVenueModel);
        if (
            this.openData.gameType != null ||
            this.openData.rummyType != null ||
            this.openData.players != null ||
            this.openData.poolGame != null
        ) {
            model.applyOpenData(this.openData);
        }
        this.SendCommand(new FetchHallRoomCatalogCommand());
        void this.open();
    }

    private async open(): Promise<void> {
        await this.GetSystem(BundleSystem).loadBundle("selectionVenue");
        this.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        await this.GetSystem(UISystem).openDialogAsync(RummySelectionDialog, BundleKey.RoomSelect, "RummySelection", {
            uiData: this.openData,
            level: UILevel.PopUI,
            playClickSfx: true,
        });
    }
}

import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { LobbyTopViewPrefab } from "../config/LobbyTopViewConfig";
import type { OpenMatchDetailsData } from "../config/LobbyTopViewProtocol";
import { FetchTournamentDetailCommand } from "./FetchTournamentDetailCommand";
import { MatchDetailsDialog } from "../ui/MatchDetailsDialog";

export class OpenMatchDetailsCommand extends AbstractCommand {
    constructor(private readonly data: OpenMatchDetailsData) {
        super();
    }

    protected OnExecute(): void {
        this.SendCommand(new FetchTournamentDetailCommand(this.data.tournamentId));
        const ui = this.GetSystem(UISystem);
        void new Promise<void>((r) => setTimeout(r, 100)).then(() =>
            ui.openDialogAsync(MatchDetailsDialog, BundleKey.HallHeader, LobbyTopViewPrefab.MatchDetails, {
                level: UILevel.PopUI,
                uiData: this.data,
            }),
        );
    }
}

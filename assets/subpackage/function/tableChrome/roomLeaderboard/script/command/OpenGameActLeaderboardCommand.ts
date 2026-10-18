import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { GameActLeaderboardPrefab } from "../config/GameActLeaderboardConfig";
import type { GameActLeaderboardOpenData } from "../config/GameActLeaderboardProtocol";
import { GameActLeaderboardDialog } from "../ui/GameActLeaderboardDialog";
import { FetchRoomChallengerPageCommand } from "./FetchRoomChallengerPageCommand";

export class OpenGameActLeaderboardCommand extends AbstractCommand {
    public constructor(private readonly openData: GameActLeaderboardOpenData) {
        super();
    }

    protected OnExecute(): void {
        this.SendCommand(new FetchRoomChallengerPageCommand(this.openData.vid, "hour", 1, false));
        const ui = this.GetSystem(UISystem);
        void ui.openDialogAsync(GameActLeaderboardDialog, BundleKey.RoomLeaderboard, GameActLeaderboardPrefab, {
            uiData: this.openData,
            level: UILevel.PopUI,
        });
    }
}

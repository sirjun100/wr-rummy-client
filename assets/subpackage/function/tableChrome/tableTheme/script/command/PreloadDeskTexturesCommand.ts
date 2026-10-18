import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { DeskAssetPath } from "../config/DeskConfig";
import { DeskStyleModel } from "../model/DeskStyleModel";
import { mapTableStyleToRoomBgIndex } from "../utility/DeskSkinResolver";
import { preloadDeskAssetNames } from "../utility/DeskSkinLoader";

export class PreloadDeskTexturesCommand extends AbstractCommand {
    protected OnExecute(): void {
        const model = this.GetModel(DeskStyleModel);
        const tableStyle = model.styles.value[0];
        const roomIdx = mapTableStyleToRoomBgIndex(tableStyle);
        const names = [DeskAssetPath.MatchDesk, DeskAssetPath.MatchRoom];
        if (tableStyle > 1) {
            names.push(`rummy_card_table_bg_0${tableStyle - 1}`);
        }
        if (roomIdx > 0) {
            names.push(`rummy_game_bg_${roomIdx + 1}`);
        }
        void preloadDeskAssetNames(names);
    }
}

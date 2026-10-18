import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { DeskStyleModel } from "../../../../function/tableChrome/tableTheme/script/model/DeskStyleModel";
import { RummyHandCardsEvent } from "../event/RummyEvents";
import { RummyModel } from "../model/RummyModel";

/** Re-broadcast hand so UI layers can refresh card face/back skins. */
export class ApplyRummyCardDisplayCommand extends AbstractCommand {
    protected OnExecute(): void {
        const model = this.GetModel(RummyModel);
        const styles = this.GetModel(DeskStyleModel).styles.value;
        if (model.handCards.length > 0) {
            this.SendEvent(new RummyHandCardsEvent(model.handCards));
        }
        void styles;
    }
}

import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { openSixpointDialog } from "../SixpointGameModule";
import { SixpointRoute } from "../config/SixpointProtocol";
import { SixpointModel } from "../model/SixpointModel";
import { SixpointNoseatRecodeDialog } from "../ui/dialogs/SixpointNoseatRecodeDialog";
import { callSixpoint } from "../utility/SixpointNetwork";

export class SixpointHistoryCommand extends AbstractCommand {
    protected OnExecute(): void {
        void callSixpoint<{ history_record?: number[][] }>(
            this.GetSystem(NetworkSystem),
            SixpointRoute.History,
            {},
        ).then(async (res) => {
            if (res.data?.history_record) {
                const model = this.GetModel(SixpointModel);
                model.historyRecord = res.data.history_record;
                if (model.table.value) {
                    model.applyTable({ ...model.table.value, history_record: res.data.history_record });
                }
            }
            const dlg = await openSixpointDialog(
                SixpointNoseatRecodeDialog,
                "SixpointNoseatRecodeDialog",
                "recode",
            );
            if (dlg) {
                dlg.refreshUI(this.GetModel(SixpointModel).historyRecord);
            }
        });
    }
}

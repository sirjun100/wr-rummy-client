import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { SixpointRoute, SixpointTableDto } from "../config/SixpointProtocol";
import { SixpointModel } from "../model/SixpointModel";
import { callSixpoint } from "../utility/SixpointNetwork";

export class SixpointSyncTableCommand extends AbstractCommand {
    protected OnExecute(): void {
        void callSixpoint<SixpointTableDto>(this.GetSystem(NetworkSystem), SixpointRoute.SyncTable, {}).then(
            (res) => {
                if (res.data) {
                    this.GetModel(SixpointModel).applyTable(res.data);
                }
            },
        );
    }
}

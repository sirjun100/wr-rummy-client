import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { SixpointRoute } from "../config/SixpointProtocol";
import { callSixpoint } from "../utility/SixpointNetwork";
import { applySixpointRpcResult } from "../utility/SixpointRpcHelper";

export class SixpointGoldRecordCommand extends AbstractCommand {
    protected OnExecute(): void {
        void callSixpoint(this.GetSystem(NetworkSystem), SixpointRoute.GoldRecord, {}).then(applySixpointRpcResult);
    }
}

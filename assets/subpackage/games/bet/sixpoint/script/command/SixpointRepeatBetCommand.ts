import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { SixpointRoute } from "../config/SixpointProtocol";
import { SixpointModel } from "../model/SixpointModel";
import { callSixpoint } from "../utility/SixpointNetwork";
import { applySixpointRpcResult } from "../utility/SixpointRpcHelper";

export class SixpointRepeatBetCommand extends AbstractCommand {
    protected OnExecute(): void {
        const model = this.GetModel(SixpointModel);
        void callSixpoint(this.GetSystem(NetworkSystem), SixpointRoute.RepeatBet, {}).then((res) => {
            applySixpointRpcResult(res);
            if (res.ret === 0 && res.betAreaInfo) {
                model.applyBetAreas(res.betAreaInfo);
            }
        });
    }
}

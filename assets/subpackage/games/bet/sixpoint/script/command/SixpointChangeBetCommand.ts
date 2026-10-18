import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { SixpointRoute } from "../config/SixpointProtocol";
import { SixpointModel } from "../model/SixpointModel";
import { callSixpoint } from "../utility/SixpointNetwork";
import { applySixpointRpcResult } from "../utility/SixpointRpcHelper";

export class SixpointChangeBetCommand extends AbstractCommand {
    public constructor(private readonly index: number) {
        super();
    }

    protected OnExecute(): void {
        const model = this.GetModel(SixpointModel);
        const cfg = model.betConfig;
        if (this.index < 0 || this.index >= cfg.length) {
            return;
        }
        const curBet = cfg[this.index];
        model.curBet = curBet;
        void callSixpoint(this.GetSystem(NetworkSystem), SixpointRoute.ChangeBet, {
            cur_bet: curBet,
            index: this.index,
        }).then(applySixpointRpcResult);
    }
}

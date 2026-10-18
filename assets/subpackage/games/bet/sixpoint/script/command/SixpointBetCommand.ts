import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { SixpointRoute } from "../config/SixpointProtocol";
import { SixpointModel } from "../model/SixpointModel";
import { callSixpoint } from "../utility/SixpointNetwork";
import { applySixpointRpcResult } from "../utility/SixpointRpcHelper";

export class SixpointBetCommand extends AbstractCommand {
    public constructor(
        private readonly option: number,
        private readonly bet?: number,
    ) {
        super();
    }

    protected OnExecute(): void {
        const model = this.GetModel(SixpointModel);
        const amount = this.bet ?? model.curBet;
        void callSixpoint(this.GetSystem(NetworkSystem), SixpointRoute.Bet, {
            option: this.option,
            bet: amount,
        }).then((res) => {
            applySixpointRpcResult(res);
            if (res.ret === 0 && res.betAreaInfo) {
                model.applyBetAreas(res.betAreaInfo);
            }
        });
    }
}

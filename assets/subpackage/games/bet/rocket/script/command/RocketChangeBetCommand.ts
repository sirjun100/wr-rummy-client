import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RocketRoute } from "../config/RocketProtocol";
import { callCrash } from "../utility/RocketNetwork";
import { logRocketCommandError } from "../utility/RocketCommandHelper";
import { applyRocketRpcResult } from "../utility/RocketRpcHelper";

export class RocketChangeBetCommand extends AbstractCommand {
    constructor(
        private readonly index: number,
        private readonly curBet: number,
    ) {
        super();
    }

    protected OnExecute(): void {
        void callCrash(this.GetSystem(NetworkSystem), RocketRoute.ChangeBet, {
            index: this.index,
            cur_bet: this.curBet,
        })
            .then((res) => applyRocketRpcResult(res))
            .catch((e) => logRocketCommandError("ChangeBet", e));
    }
}

import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RocketRoute } from "../config/RocketProtocol";
import { callCrash } from "../utility/RocketNetwork";
import { logRocketCommandError } from "../utility/RocketCommandHelper";
import { applyRocketRpcResult } from "../utility/RocketRpcHelper";

export class RocketBetCommand extends AbstractCommand {
    constructor(
        private readonly index: number,
        private readonly bet: number,
    ) {
        super();
    }

    protected OnExecute(): void {
        void callCrash(this.GetSystem(NetworkSystem), RocketRoute.Bet, {
            index: this.index,
            bet: this.bet,
        })
            .then((res) => applyRocketRpcResult(res))
            .catch((e) => logRocketCommandError("Bet", e));
    }
}

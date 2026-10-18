import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RocketRoute } from "../config/RocketProtocol";
import { callCrash } from "../utility/RocketNetwork";
import { logRocketCommandError } from "../utility/RocketCommandHelper";
import { applyRocketRpcResult } from "../utility/RocketRpcHelper";

export class RocketAutoBetCommand extends AbstractCommand {
    constructor(
        private readonly index: number,
        private readonly enable: number,
        private readonly rounds: number,
        private readonly autoOut: number,
    ) {
        super();
    }

    protected OnExecute(): void {
        void callCrash(this.GetSystem(NetworkSystem), RocketRoute.Bet, {
            index: this.index,
            enable: this.enable,
            rounds: this.rounds,
            auto_out: this.autoOut,
        })
            .then((res) => applyRocketRpcResult(res))
            .catch((e) => logRocketCommandError("AutoBet", e));
    }
}

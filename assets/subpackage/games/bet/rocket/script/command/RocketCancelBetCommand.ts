import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RocketRoute } from "../config/RocketProtocol";
import { callCrash } from "../utility/RocketNetwork";
import { logRocketCommandError } from "../utility/RocketCommandHelper";
import { applyRocketRpcResult } from "../utility/RocketRpcHelper";

export class RocketCancelBetCommand extends AbstractCommand {
    constructor(private readonly index: number) {
        super();
    }

    protected OnExecute(): void {
        void callCrash(this.GetSystem(NetworkSystem), RocketRoute.CancelBet, { index: this.index })
            .then((res) => applyRocketRpcResult(res))
            .catch((e) => logRocketCommandError("CancelBet", e));
    }
}

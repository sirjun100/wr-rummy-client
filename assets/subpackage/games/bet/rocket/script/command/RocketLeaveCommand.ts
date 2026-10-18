import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RocketRoute } from "../config/RocketProtocol";
import { callCrash } from "../utility/RocketNetwork";
import { logRocketCommandError } from "../utility/RocketCommandHelper";

export class RocketLeaveCommand extends AbstractCommand {
    protected OnExecute(): void {
        void callCrash(this.GetSystem(NetworkSystem), RocketRoute.LeaveHall, {}).catch((e) =>
            logRocketCommandError("LeaveHall", e),
        );
    }
}

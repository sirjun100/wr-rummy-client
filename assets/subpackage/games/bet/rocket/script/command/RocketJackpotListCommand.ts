import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RocketRoute } from "../config/RocketProtocol";
import { RocketJackpotListEvent } from "../event/RocketEvents";
import { callCrash } from "../utility/RocketNetwork";
import { logRocketCommandError } from "../utility/RocketCommandHelper";

export class RocketJackpotListCommand extends AbstractCommand {
    constructor(private readonly lastTimes: number) {
        super();
    }

    protected OnExecute(): void {
        void callCrash(this.GetSystem(NetworkSystem), RocketRoute.SyncTable, {
            jackpot_list: true,
            last_times: this.lastTimes,
        })
            .then((res) => {
                if (res.jackpot) {
                    this.SendEvent(new RocketJackpotListEvent(res.jackpot));
                }
            })
            .catch((e) => logRocketCommandError("JackpotList", e));
    }
}

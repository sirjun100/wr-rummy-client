import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RocketRoute, RocketTableDto } from "../config/RocketProtocol";
import { RocketModel } from "../model/RocketModel";
import { callCrash } from "../utility/RocketNetwork";
import { logRocketCommandError } from "../utility/RocketCommandHelper";

export class RocketSyncTableCommand extends AbstractCommand {
    constructor(
        private readonly flySnapshot = false,
        private readonly jackpotList = false,
        private readonly lastTimes = 0,
    ) {
        super();
    }

    protected OnExecute(): void {
        void callCrash<RocketTableDto>(this.GetSystem(NetworkSystem), RocketRoute.SyncTable, {
            fly_snapshot: this.flySnapshot,
            jackpot_list: this.jackpotList,
            last_times: this.lastTimes,
        })
            .then((res) => {
                const model = this.GetModel(RocketModel);
                if (res.data) {
                    model.applyTable(res.data);
                }
            })
            .catch((e) => logRocketCommandError("SyncTable", e));
    }
}

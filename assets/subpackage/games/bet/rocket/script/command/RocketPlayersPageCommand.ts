import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RocketRoute } from "../config/RocketProtocol";
import { RocketPlayersPageEvent } from "../event/RocketEvents";
import { callCrash } from "../utility/RocketNetwork";
import { logRocketCommandError } from "../utility/RocketCommandHelper";

export class RocketPlayersPageCommand extends AbstractCommand {
    constructor(private readonly page: number) {
        super();
    }

    protected OnExecute(): void {
        void callCrash(this.GetSystem(NetworkSystem), RocketRoute.PlayersPage, { page: this.page })
            .then((res) => {
                if (res.data) {
                    this.SendEvent(new RocketPlayersPageEvent(res.data));
                }
            })
            .catch((e) => logRocketCommandError("PlayersPage", e));
    }
}

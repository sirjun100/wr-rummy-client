import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { CricketRoute } from "../config/CricketProtocol";
import { callCricket } from "../utility/CricketNetwork";
import { logCricketCommandError } from "../utility/CricketCommandHelper";
import { CricketModel } from "../model/CricketModel";

export class FetchCricketPlayerInfoCommand extends AbstractCommand {
    public constructor(private readonly matchId: number, private readonly playerId: number) {
        super();
    }

    protected OnExecute(): void {
        void callCricket<unknown>(this.GetSystem(NetworkSystem), CricketRoute.PlayerInfo, { match_id: this.matchId, player_id: this.playerId })
            .then((data) => {
                this.GetModel(CricketModel).setInsightCache("PlayerInfo", data);
            })
            .catch((e) => logCricketCommandError("PlayerInfo", e));
    }
}

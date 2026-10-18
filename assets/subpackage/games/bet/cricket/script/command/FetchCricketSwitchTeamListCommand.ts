import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { CricketRoute } from "../config/CricketProtocol";
import { callCricket } from "../utility/CricketNetwork";
import { logCricketCommandError } from "../utility/CricketCommandHelper";
import { CricketModel } from "../model/CricketModel";

export class FetchCricketSwitchTeamListCommand extends AbstractCommand {
    public constructor(private readonly matchId: number) {
        super();
    }

    protected OnExecute(): void {
        void callCricket<unknown>(this.GetSystem(NetworkSystem), CricketRoute.SwitchTeamList, { match_id: this.matchId })
            .then((data) => {
                this.GetModel(CricketModel).setInsightCache("SwitchTeamList", data);
            })
            .catch((e) => logCricketCommandError("SwitchTeamList", e));
    }
}

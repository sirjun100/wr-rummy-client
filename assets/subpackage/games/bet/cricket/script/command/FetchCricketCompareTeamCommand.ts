import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { CricketRoute } from "../config/CricketProtocol";
import { callCricket } from "../utility/CricketNetwork";
import { logCricketCommandError } from "../utility/CricketCommandHelper";
import { CricketModel } from "../model/CricketModel";

export class FetchCricketCompareTeamCommand extends AbstractCommand {
    public constructor(private readonly body: object) {
        super();
    }

    protected OnExecute(): void {
        void callCricket<unknown>(this.GetSystem(NetworkSystem), CricketRoute.CompareTeam, this.body)
            .then((data) => {
                this.GetModel(CricketModel).setInsightCache("CompareTeam", data);
            })
            .catch((e) => logCricketCommandError("CompareTeam", e));
    }
}

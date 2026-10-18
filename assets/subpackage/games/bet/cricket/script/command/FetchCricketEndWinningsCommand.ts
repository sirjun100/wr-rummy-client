import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { CricketRoute } from "../config/CricketProtocol";
import { callCricket } from "../utility/CricketNetwork";
import { logCricketCommandError } from "../utility/CricketCommandHelper";
import { CricketModel } from "../model/CricketModel";

export class FetchCricketEndWinningsCommand extends AbstractCommand {
    public constructor(private readonly matchId: number, private readonly contestId: number) {
        super();
    }

    protected OnExecute(): void {
        void callCricket<unknown>(this.GetSystem(NetworkSystem), CricketRoute.EndWinnings, { match_id: this.matchId, contest_id: this.contestId })
            .then((data) => {
                this.GetModel(CricketModel).setInsightCache("EndWinnings", data);
            })
            .catch((e) => logCricketCommandError("EndWinnings", e));
    }
}

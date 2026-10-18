import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { CricketRoute } from "../config/CricketProtocol";
import { callCricket } from "../utility/CricketNetwork";
import { logCricketCommandError } from "../utility/CricketCommandHelper";
import { CricketModel } from "../model/CricketModel";

export class FetchCricketMoneyLessCommand extends AbstractCommand {

    protected OnExecute(): void {
        void callCricket<unknown>(this.GetSystem(NetworkSystem), CricketRoute.MoneyLess, {})
            .then((data) => {
                this.GetModel(CricketModel).setInsightCache("MoneyLess", data);
            })
            .catch((e) => logCricketCommandError("MoneyLess", e));
    }
}

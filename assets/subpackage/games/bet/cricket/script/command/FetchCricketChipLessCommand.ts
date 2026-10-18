import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { CricketRoute } from "../config/CricketProtocol";
import { callCricket } from "../utility/CricketNetwork";
import { logCricketCommandError } from "../utility/CricketCommandHelper";
import { CricketModel } from "../model/CricketModel";

export class FetchCricketChipLessCommand extends AbstractCommand {

    protected OnExecute(): void {
        void callCricket<unknown>(this.GetSystem(NetworkSystem), CricketRoute.ChipLess, {})
            .then((data) => {
                this.GetModel(CricketModel).setInsightCache("ChipLess", data);
            })
            .catch((e) => logCricketCommandError("ChipLess", e));
    }
}

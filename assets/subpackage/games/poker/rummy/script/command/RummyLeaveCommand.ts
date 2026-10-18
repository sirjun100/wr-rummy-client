import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RummyRoute } from "../config/RummyProtocol";
import { callRummy } from "../utility/RummyNetwork";
import { unsubscribeRummyPush } from "./RummySubscribePushCommand";
import { RummyModel } from "../model/RummyModel";
import { unloadRummyMainTable } from "../utility/RummyTableLoader";

export class RummyLeaveCommand extends AbstractCommand {
    protected OnExecute(): void {
        void callRummy(this.GetSystem(NetworkSystem), RummyRoute.LeaveRoom, {}).finally(() => {
            unsubscribeRummyPush();
            this.GetModel(RummyModel).resetTable();
            unloadRummyMainTable();
        });
    }
}

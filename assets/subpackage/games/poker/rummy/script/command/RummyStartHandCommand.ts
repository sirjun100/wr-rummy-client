import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RummyRoute } from "../config/RummyProtocol";
import { callRummy } from "../utility/RummyNetwork";

export class RummyStartHandCommand extends AbstractCommand {
    protected OnExecute(): void {
        void callRummy(this.GetSystem(NetworkSystem), RummyRoute.StartRoom, {});
    }
}

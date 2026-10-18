import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { SixpointRoute } from "../config/SixpointProtocol";
import { callSixpoint } from "../utility/SixpointNetwork";
import { applySixpointRpcResult } from "../utility/SixpointRpcHelper";

export class SixpointSitDownCommand extends AbstractCommand {
    public constructor(private readonly seatId: number) {
        super();
    }

    protected OnExecute(): void {
        void callSixpoint(this.GetSystem(NetworkSystem), SixpointRoute.SitDown, {
            seatid: this.seatId,
        }).then(applySixpointRpcResult);
    }
}

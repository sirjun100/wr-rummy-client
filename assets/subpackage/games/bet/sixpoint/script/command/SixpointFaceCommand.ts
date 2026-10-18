import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { SixpointRoute } from "../config/SixpointProtocol";
import { callSixpoint } from "../utility/SixpointNetwork";
import { applySixpointRpcResult } from "../utility/SixpointRpcHelper";

export class SixpointFaceCommand extends AbstractCommand {
    public constructor(private readonly faceId: number) {
        super();
    }

    protected OnExecute(): void {
        void callSixpoint(this.GetSystem(NetworkSystem), SixpointRoute.Face, {
            face_id: this.faceId,
        }).then(applySixpointRpcResult);
    }
}

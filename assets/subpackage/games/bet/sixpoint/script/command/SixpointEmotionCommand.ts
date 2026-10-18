import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { SixpointRoute } from "../config/SixpointProtocol";
import { callSixpoint } from "../utility/SixpointNetwork";
import { applySixpointRpcResult } from "../utility/SixpointRpcHelper";

export class SixpointEmotionCommand extends AbstractCommand {
    public constructor(private readonly emotionId: number) {
        super();
    }

    protected OnExecute(): void {
        void callSixpoint(this.GetSystem(NetworkSystem), SixpointRoute.Emotion, {
            emotion_id: this.emotionId,
        }).then(applySixpointRpcResult);
    }
}

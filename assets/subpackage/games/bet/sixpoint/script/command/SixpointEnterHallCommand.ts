import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { SixpointRoute, SixpointTableDto } from "../config/SixpointProtocol";
import { SixpointEnterReadyEvent } from "../event/SixpointEvents";
import { SixpointModel } from "../model/SixpointModel";
import { callSixpoint } from "../utility/SixpointNetwork";
import { LogKit } from "../../../../../../script/framework/toolkits/coreKit/logKit/LogKit";

export class SixpointEnterHallCommand extends AbstractCommand {
    public constructor(private readonly templateId: string = "default") {
        super();
    }

    protected OnExecute(): void {
        const model = this.GetModel(SixpointModel);
        model.templateId = this.templateId;
        void callSixpoint<SixpointTableDto>(this.GetSystem(NetworkSystem), SixpointRoute.EnterHall, {
            template_id: this.templateId,
        })
            .then((res) => {
                if (res.data) {
                    model.applyTable(res.data);
                }
                this.SendEvent(new SixpointEnterReadyEvent());
            })
            .catch((e) => LogKit.E("[Sixpoint] EnterHall {0}", String(e)));
    }
}

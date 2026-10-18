import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RocketRoute, RocketTableDto } from "../config/RocketProtocol";
import { RocketEnterReadyEvent } from "../event/RocketEvents";
import { RocketModel } from "../model/RocketModel";
import { callCrash } from "../utility/RocketNetwork";
import { logRocketCommandError } from "../utility/RocketCommandHelper";

export class RocketEnterHallCommand extends AbstractCommand {
    constructor(private readonly templateId: string = "default") {
        super();
    }

    protected OnExecute(): void {
        const model = this.GetModel(RocketModel);
        model.templateId = this.templateId;
        void callCrash<RocketTableDto>(this.GetSystem(NetworkSystem), RocketRoute.EnterHall, {
            template_id: this.templateId,
        })
            .then((res) => {
                if (res.data) {
                    model.applyTable(res.data);
                }
                this.SendEvent(new RocketEnterReadyEvent());
            })
            .catch((e) => logRocketCommandError("EnterHall", e));
    }
}

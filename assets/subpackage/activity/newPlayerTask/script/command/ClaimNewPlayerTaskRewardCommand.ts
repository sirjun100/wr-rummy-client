import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { NewPlayerTaskClaimRes, NewPlayerTaskRoute } from "../config/NewPlayerTaskConfig";
import {
    NewPlayerTaskClaimFailedEvent,
    NewPlayerTaskClaimSuccessEvent,
} from "../event/NewPlayerTaskEvents";
import { NewPlayerTaskModel } from "../model/NewPlayerTaskModel";

export type ClaimNewPlayerTaskPayload = {
    vid: number;
    type: number;
    task_id: number;
    sub_task_id: number;
};

export class ClaimNewPlayerTaskRewardCommand extends AbstractCommand {
    public constructor(private readonly payload: ClaimNewPlayerTaskPayload) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<NewPlayerTaskClaimRes>(NewPlayerTaskRoute.Claim, this.payload)
            .then((res) => {
                if (res.page) {
                    this.GetModel(NewPlayerTaskModel).page.value = res.page;
                }
                this.SendEvent(new NewPlayerTaskClaimSuccessEvent(res));
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[ClaimNewPlayerTaskRewardCommand] {0}", msg);
                this.SendEvent(new NewPlayerTaskClaimFailedEvent(msg));
            });
    }
}

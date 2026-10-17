import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import {
    BeginnerFlipClaimRes,
    BeginnerFlipTaskRoute,
} from "../config/BeginnerFlipTaskConfig";
import {
    BeginnerFlipClaimFailedEvent,
    BeginnerFlipClaimSuccessEvent,
} from "../event/BeginnerFlipTaskEvents";
import { BeginnerFlipTaskModel } from "../model/BeginnerFlipTaskModel";

export class ClaimBeginnerFlipRewardCommand extends AbstractCommand {
    public constructor(
        private readonly taskId: number,
        private readonly selectIndex: number,
        private readonly vid: string,
        private readonly tidKey: string,
    ) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<BeginnerFlipClaimRes>(BeginnerFlipTaskRoute.ClaimFlip, {
                task_id: this.taskId,
                select_index: this.selectIndex,
                vid: this.vid,
                tid_key: this.tidKey,
            })
            .then((res) => {
                const model = this.GetModel(BeginnerFlipTaskModel);
                if (res.task_data) {
                    model.page.value = res.task_data;
                }
                if (res.reward_list) {
                    model.records.value = res.reward_list;
                }
                this.SendEvent(new BeginnerFlipClaimSuccessEvent(res));
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[ClaimBeginnerFlipRewardCommand] {0}", msg);
                this.SendEvent(new BeginnerFlipClaimFailedEvent(msg));
            });
    }
}

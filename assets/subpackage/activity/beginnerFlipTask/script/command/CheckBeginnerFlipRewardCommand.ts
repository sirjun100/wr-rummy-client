import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import {
    BeginnerFlipCheckRes,
    BeginnerFlipTaskRoute,
} from "../config/BeginnerFlipTaskConfig";
import { BeginnerFlipCheckReadyEvent } from "../event/BeginnerFlipTaskEvents";

export class CheckBeginnerFlipRewardCommand extends AbstractCommand {
    public constructor(
        private readonly vid: string,
        private readonly tidKey: string = "",
    ) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<BeginnerFlipCheckRes>(BeginnerFlipTaskRoute.CheckReward, { vid: this.vid })
            .then((res) => {
                if (res.show === 1 && res.task_data && res.task_id) {
                    this.SendEvent(
                        new BeginnerFlipCheckReadyEvent(
                            res.task_id,
                            res.task_data,
                            this.vid,
                            this.tidKey,
                        ),
                    );
                }
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[CheckBeginnerFlipRewardCommand] {0}", msg);
            });
    }
}

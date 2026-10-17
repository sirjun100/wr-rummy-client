import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import {
    BeginnerFlipRecordsRes,
    BeginnerFlipTaskRoute,
} from "../config/BeginnerFlipTaskConfig";
import { BeginnerFlipRecordsFetchFailedEvent } from "../event/BeginnerFlipTaskEvents";
import { BeginnerFlipTaskModel } from "../model/BeginnerFlipTaskModel";

export class FetchBeginnerFlipRecordsCommand extends AbstractCommand {
    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<BeginnerFlipRecordsRes>(BeginnerFlipTaskRoute.Records, {})
            .then((res) => {
                const list = res.reward_list ?? [];
                this.GetModel(BeginnerFlipTaskModel).records.value = list;
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[FetchBeginnerFlipRecordsCommand] {0}", msg);
                this.SendEvent(new BeginnerFlipRecordsFetchFailedEvent(msg));
            });
    }
}

import { AbstractCommand } from "../../../framework/QFramework";
import { LogKit } from "../../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { ChallengerSharedRoute, type OptEntryRes } from "../config/ChallengerProtocol";
import { ChallengerEntryModel } from "../model/ChallengerEntryModel";

export class ChallengerOptEntryCommand extends AbstractCommand {
    public constructor(
        private readonly status: number,
        private readonly afterSuccess?: () => void,
    ) {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<OptEntryRes>(ChallengerSharedRoute.OptEntry, { status: this.status })
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[ChallengerOptEntryCommand] code={0}", res.code);
                    return;
                }
                const next = res.data?.status ?? this.status;
                this.GetModel(ChallengerEntryModel).entryStatus.value = next;
                this.afterSuccess?.();
            })
            .catch((err) => {
                LogKit.W(
                    "[ChallengerOptEntryCommand] {0}",
                    err instanceof Error ? err.message : String(err),
                );
            });
    }
}

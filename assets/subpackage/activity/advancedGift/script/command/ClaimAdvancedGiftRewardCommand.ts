import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { AdvancedGiftRoute } from "../config/AdvancedGiftRoutes";
import { AdvancedGiftClaimRes } from "../config/AdvancedGiftTypes";
import { AdvancedGiftClaimSuccessEvent, AdvancedGiftFetchFailedEvent } from "../event/AdvancedGiftEvents";
import { AdvancedGiftModel } from "../model/AdvancedGiftModel";

export class ClaimAdvancedGiftRewardCommand extends AbstractCommand {
    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<AdvancedGiftClaimRes>(AdvancedGiftRoute.Claim, {})
            .then((res) => {
                const reward = res.reward ?? {};
                const page = res.page;
                if (page) {
                    page.ui_type = 2;
                    this.GetModel(AdvancedGiftModel).page.value = page;
                    this.SendEvent(new AdvancedGiftClaimSuccessEvent(reward, page, res.tips ?? ""));
                }
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[ClaimAdvancedGiftRewardCommand] {0}", msg);
                this.SendEvent(new AdvancedGiftFetchFailedEvent(msg));
            });
    }
}

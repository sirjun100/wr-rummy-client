import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { AdvancedGiftRoute } from "../config/AdvancedGiftRoutes";
import { AdvancedGiftPageRes } from "../config/AdvancedGiftTypes";
import { AdvancedGiftFetchFailedEvent } from "../event/AdvancedGiftEvents";
import { AdvancedGiftModel } from "../model/AdvancedGiftModel";

export class FetchAdvancedGiftPageCommand extends AbstractCommand {
    public constructor(private readonly uiType: number = 0) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<AdvancedGiftPageRes>(AdvancedGiftRoute.Page, { ui_type: this.uiType })
            .then((res) => {
                const page = res as AdvancedGiftPageRes;
                this.GetModel(AdvancedGiftModel).page.value = page;
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[FetchAdvancedGiftPageCommand] {0}", msg);
                this.SendEvent(new AdvancedGiftFetchFailedEvent(msg));
            });
    }
}

import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { PublicLobbyRoute, PublicI18n } from "../config/PublicConfig";
import type { FaqPageRes } from "../config/PublicProtocol";
import { PublicModel } from "../model/PublicModel";
import { ensurePublicRegistered } from "../PublicModule";

export class FetchFaqPageCommand extends AbstractCommand {
    protected OnExecute(): void {
        ensurePublicRegistered();
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<FaqPageRes>(PublicLobbyRoute.FaqPage, {})
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    this.GetSystem(UISystem).showToast(PublicI18n.faqLoadFail);
                    return;
                }
                this.GetModel(PublicModel).faq.Value = res.categories ?? [];
            })
            .catch((err) => {
                LogKit.W("[FetchFaqPageCommand] {0}", err instanceof Error ? err.message : String(err));
                this.GetSystem(UISystem).showToast(PublicI18n.faqLoadFail);
            });
    }
}

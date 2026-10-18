import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { PublicLobbyRoute, PublicI18n, MaxFeedbackLength } from "../config/PublicConfig";
import type { CodeRes, FeedbackSubmitReq } from "../config/PublicProtocol";

export class SubmitFeedbackCommand extends AbstractCommand {
    public constructor(private readonly payload: FeedbackSubmitReq) {
        super();
    }

    protected OnExecute(): void {
        const content = (this.payload.content ?? "").trim();
        if (!content) {
            this.GetSystem(UISystem).showToast(PublicI18n.feedbackEmpty);
            return;
        }
        if (content.length > MaxFeedbackLength) {
            this.GetSystem(UISystem).showToast(PublicI18n.feedbackFail);
            return;
        }
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<CodeRes>(PublicLobbyRoute.FeedbackSubmit, {
                scene: this.payload.scene ?? "feedback",
                content,
                contact: this.payload.contact ?? "",
            })
            .then((res) => {
                const ui = this.GetSystem(UISystem);
                if (res.code === 0 || res.code === undefined) {
                    ui.showToast(PublicI18n.feedbackOk);
                } else {
                    ui.showToast(PublicI18n.feedbackFail);
                }
            })
            .catch((err) => {
                LogKit.W("[SubmitFeedbackCommand] {0}", err instanceof Error ? err.message : String(err));
                this.GetSystem(UISystem).showToast(PublicI18n.feedbackFail);
            });
    }
}

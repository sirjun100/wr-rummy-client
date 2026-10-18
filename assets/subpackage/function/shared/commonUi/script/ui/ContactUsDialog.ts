import { _decorator, sys } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { PublicModel } from "../model/PublicModel";
import { bindContactChannels } from "../controller/ContactChannelBinder";
import { wireButtonByName } from "../utility/PublicDialogUtil";
import { ensurePublicRegistered } from "../PublicModule";
import { OpenFeedbackDialogCommand } from "../command/OpenFeedbackDialogCommand";

const { ccclass } = _decorator;

@ccclass("ContactUsDialog")
export class ContactUsDialog extends BaseDialog {
    protected OnInit(): void {
        ensurePublicRegistered();
        wireButtonByName(this.node, "close_btn", () => this.CloseSelf(), this);
        const model = GameApp.Interface.GetModel(PublicModel);
        const apply = () => bindContactChannels(this.node, model.supportChannels.Value ?? {});
        apply();
        model.supportChannels.Register(() => apply()).UnRegisterWhenGameObjectDestroyed(this.node);
        const feedbackUrl = (model.supportChannels.Value?.feedback_url ?? "").trim();
        const supportOn = (model.supportChannels.Value?.support_enabled ?? 1) !== 0;
        wireButtonByName(this.node, "feedback", () => {
            if (feedbackUrl) {
                sys.openURL(feedbackUrl);
                return;
            }
            GameApp.Interface.SendCommand(new OpenFeedbackDialogCommand({ scene: "contact" }));
        }, this);
        if (!feedbackUrl && !supportOn) {
            const fb = this.node.getChildByName("feedback");
            fb?.active = false;
        }
    }

    protected OnClose(): void {}
}

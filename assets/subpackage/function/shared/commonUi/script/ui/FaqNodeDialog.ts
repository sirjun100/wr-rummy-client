import { _decorator } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { PublicModel } from "../model/PublicModel";
import { bindFaqCategories } from "../controller/FaqCategoryBinder";
import { ensurePublicRegistered } from "../PublicModule";
import { wireButtonByName } from "../utility/PublicDialogUtil";

const { ccclass } = _decorator;

@ccclass("FaqNodeDialog")
export class FaqNodeDialog extends BaseDialog {
    protected OnInit(): void {
        ensurePublicRegistered();
        wireButtonByName(this.node, "back", () => this.CloseSelf(), this);
        wireButtonByName(this.node, "back_big", () => this.CloseSelf(), this);
        const model = GameApp.Interface.GetModel(PublicModel);
        bindFaqCategories(this.node, model.faq.Value ?? []);
        model.faq.Register((cats) => {
            bindFaqCategories(this.node, cats ?? []);
        }).UnRegisterWhenGameObjectDestroyed(this.node);
    }

    protected OnClose(): void {}
}

import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { GameplayContextModel } from "../../../../../script/game/model/GameplayContextModel";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { TransitionModel } from "../model/TransitionModel";

export class CompleteTransitionToLoginCommand extends AbstractCommand {
    protected OnExecute(): void {
        this.GetModel(GameplayContextModel).reset();
        void this.GetSystem(BundleSystem)
            .goMain()
            .then(() => {
                const tm = this.GetModel(TransitionModel);
                tm.running = false;
                tm.intent = null;
                this.GetSystem(UISystem).hideBlockingLoading();
            })
            .catch(() => {
                const tm = this.GetModel(TransitionModel);
                tm.running = false;
                tm.intent = null;
                this.GetSystem(UISystem).hideBlockingLoading();
            });
    }
}

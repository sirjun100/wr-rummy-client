import { _decorator } from "cc";
import { BaseController } from "../../../../../script/game/controller/engine/BaseController";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { SubGameId } from "../../../../../script/game/config/BundleManifest";
import { RunTransitionPipelineCommand } from "../command/RunTransitionPipelineCommand";
import { ensureTransitionRegistered } from "../TransitionModule";
import { TransitionModel } from "../model/TransitionModel";
import { buildTransitionDeskContext } from "../utility/TransitionDeskContext";
import { TransitionLayerController } from "./TransitionLayerController";

const { ccclass } = _decorator;

@ccclass("TransitionSceneController")
export class TransitionSceneController extends BaseController {
    protected onLoad(): void {
        LogKit.I("[TransitionSceneController] onLoad");
        ensureTransitionRegistered();
        const model = this.GetModel(TransitionModel);
        const intent = model.intent;
        let layer = this.getComponent(TransitionLayerController);
        if (!layer) {
            layer = this.addComponent(TransitionLayerController);
        }
        if (intent) {
            layer.applyMode(intent.mode);
        }
        void this.wireDesk(intent?.subGameId ?? SubGameId.None).then(() => {
            this.SendCommand(new RunTransitionPipelineCommand());
        });
    }

    private async wireDesk(subGameId: SubGameId): Promise<void> {
        const desk = await import("../../../../tableChrome/tableTheme/script/DeskModule");
        desk.ensureDeskRegistered();
        await desk.preloadDeskBundle();
        if (subGameId === SubGameId.None) {
            return;
        }
        const context = await buildTransitionDeskContext(subGameId);
        const layer = this.getComponent(TransitionLayerController);
        const root = layer?.room_bg ?? this.node;
        desk.wireRoomBgOnRoot(root, context);
    }
}

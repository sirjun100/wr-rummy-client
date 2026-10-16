import { _decorator } from "cc";
import { BaseController } from "../../../../../script/game/controller/engine/BaseController";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";

const { ccclass } = _decorator;

@ccclass("TransitionSceneController")
export class TransitionSceneController extends BaseController {
    protected onLoad(): void {
        LogKit.I("[TransitionSceneController] onLoad");
    }
}

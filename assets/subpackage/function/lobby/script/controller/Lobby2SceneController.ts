import { _decorator } from "cc";
import { BaseController } from "../../../../../script/game/controller/engine/BaseController";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";

const { ccclass } = _decorator;

@ccclass("Lobby2SceneController")
export class Lobby2SceneController extends BaseController {
    protected onLoad(): void {
        LogKit.I("[Lobby2SceneController] onLoad");
    }
}

import { _decorator } from "cc";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { LobbySceneController } from "./LobbySceneController";

const { ccclass } = _decorator;

/** Lobby2 theme: same module/data flow as Lobby, layout differs in editor. */
@ccclass("Lobby2SceneController")
export class Lobby2SceneController extends LobbySceneController {
    protected onLoad(): void {
        LogKit.I("[Lobby2SceneController] onLoad");
        super.onLoad();
    }
}

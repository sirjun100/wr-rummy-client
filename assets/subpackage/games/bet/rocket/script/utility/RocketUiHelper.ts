import { GameApp } from "../../../../../../script/game/GameApp";
import { UISystem } from "../../../../../../script/game/system/UISystem";
import { LogKit } from "../../../../../../script/framework/toolkits/coreKit/logKit/LogKit";

export function showRocketToast(message: string): void {
    LogKit.I("[Rocket] toast: {0}", message);
    GameApp.Interface.GetSystem(UISystem).showToast(message);
}

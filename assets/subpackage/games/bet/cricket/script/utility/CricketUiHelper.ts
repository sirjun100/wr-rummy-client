import { GameApp } from "../../../../../script/game/GameApp";
import { UISystem } from "../../../../../script/game/system/UISystem";

export function showCricketToast(message: string): void {
    GameApp.Interface.GetSystem(UISystem).showToast(message);
}

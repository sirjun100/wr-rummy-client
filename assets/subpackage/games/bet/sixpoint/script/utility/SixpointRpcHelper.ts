import { GameApp } from "../../../../../script/game/GameApp";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { SixpointRes } from "../config/SixpointProtocol";
import { SixpointMoneyLessEvent } from "../event/SixpointEvents";
import { SixpointModel } from "../model/SixpointModel";

export function applySixpointRpcResult(res: SixpointRes): void {
    const model = GameApp.Interface.GetModel(SixpointModel);
    if (res.money != null && model.table.value) {
        model.applyTable({ ...model.table.value, money: res.money });
    }
    if (res.err_msg) {
        GameApp.Interface.GetSystem(UISystem).showToast(res.err_msg);
    }
    if (res.ret === 1 && res.pop_addgold === 1) {
        GameApp.Interface.SendEvent(new SixpointMoneyLessEvent(res.cur_bet ?? 0));
        GameApp.Interface.GetSystem(UISystem).showToast("Insufficient balance");
    }
}

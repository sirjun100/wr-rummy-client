import { GameApp } from "../../../../../script/game/GameApp";
import { RocketRes } from "../config/RocketProtocol";
import { RocketBtStateUpdatedEvent, RocketMoneyLessEvent } from "../event/RocketEvents";
import { RocketModel } from "../model/RocketModel";
import { showRocketToast } from "./RocketUiHelper";

export function applyRocketRpcResult(res: RocketRes): void {
    const model = GameApp.Interface.GetModel(RocketModel);
    if (res.money != null && model.table.value) {
        model.applyTable({ ...model.table.value, money: res.money });
    }
    if (res.bt_state) {
        GameApp.Interface.SendEvent(new RocketBtStateUpdatedEvent(res.bt_state, res.ext ?? {}));
    }
    if (res.ret === 1 && res.pop_addgold === 1) {
        GameApp.Interface.SendEvent(new RocketMoneyLessEvent(res.cur_bet ?? 0));
        showRocketToast("Insufficient balance");
    }
}

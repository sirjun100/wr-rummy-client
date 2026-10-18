import { GameApp } from "../../../../../script/game/GameApp";
import { RocketPushKind, RocketPushPayload } from "./config/RocketProtocol";
import {
    RocketCrashPushEvent,
    RocketOnlineCountEvent,
    RocketPhaseBetEvent,
    RocketPhaseEndEvent,
    RocketPhaseFlyEvent,
    RocketSomeoneBetEvent,
    RocketSomeoneCashOutEvent,
    RocketWinRateTickEvent,
} from "./event/RocketEvents";
import { RocketModel } from "./model/RocketModel";
import { RocketSyncTableCommand } from "./command/RocketSyncTableCommand";

export class RocketGameLogic {
    public static handlePush(payload: RocketPushPayload): void {
        const model = GameApp.Interface.GetModel(RocketModel);
        const tid = model.tidKey.value;
        if (payload.tid_key && tid && payload.tid_key !== tid) {
            return;
        }
        const kind = payload.kind ?? "";
        switch (kind) {
            case RocketPushKind.NotifyBet:
                if (payload.state != null) {
                    model.gameState = payload.state;
                }
                if (payload.cd != null) {
                    model.gameCd = payload.cd;
                }
                GameApp.Interface.SendEvent(
                    new RocketPhaseBetEvent(payload.cd ?? 0, payload.total_cd ?? payload.cd ?? 0),
                );
                break;
            case RocketPushKind.NotifyFly:
                if (payload.state != null) {
                    model.gameState = payload.state;
                }
                GameApp.Interface.SendEvent(new RocketPhaseFlyEvent());
                break;
            case RocketPushKind.RollResult:
                if (payload.win_rate != null) {
                    GameApp.Interface.SendEvent(new RocketPhaseEndEvent(payload.win_rate, true));
                }
                if (payload.money != null && model.table.value) {
                    const t = { ...model.table.value, money: payload.money };
                    model.applyTable(t);
                }
                if (payload.jackpot_pool != null) {
                    model.jackPotNum = payload.jackpot_pool;
                }
                break;
            case RocketPushKind.UpdateTimeBet:
                if (payload.win_rate != null) {
                    GameApp.Interface.SendEvent(new RocketWinRateTickEvent(payload.win_rate));
                }
                break;
            case RocketPushKind.JpPoolAmount:
                if (payload.jackpot_pool != null) {
                    model.jackPotNum = payload.jackpot_pool;
                }
                break;
            case RocketPushKind.SomeoneCashOut:
                GameApp.Interface.SendEvent(new RocketSomeoneCashOutEvent(payload as Record<string, unknown>));
                break;
            case RocketPushKind.SomeoneBet:
                GameApp.Interface.SendEvent(new RocketSomeoneBetEvent(payload as Record<string, unknown>));
                break;
            case RocketPushKind.OnlineCount:
                if (payload.count != null) {
                    GameApp.Interface.SendEvent(new RocketOnlineCountEvent(payload.count));
                }
                break;
            default:
                break;
        }
    }

    public static bindPush(): void {
        GameApp.Interface.RegisterEvent(RocketCrashPushEvent, (e) => {
            RocketGameLogic.handlePush(e.payload);
        });
    }

    public static requestResync(): void {
        GameApp.Interface.SendCommand(new RocketSyncTableCommand(true));
    }
}

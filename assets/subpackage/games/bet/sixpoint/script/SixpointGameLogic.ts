import { GameApp } from "../../../../../script/game/GameApp";
import { SixpointPushKind, SixpointPushPayload } from "./config/SixpointProtocol";
import { SixpointSyncTableCommand } from "./command/SixpointSyncTableCommand";
import {
    SixpointBetAreasUpdatedEvent,
    SixpointChatPushEvent,
    SixpointOnlineCountEvent,
    SixpointPhaseBetEvent,
    SixpointPhaseRestEvent,
    SixpointPushEvent,
    SixpointRichPlayersEvent,
    SixpointRollResultEvent,
} from "./event/SixpointEvents";
import { SixpointModel } from "./model/SixpointModel";

export class SixpointGameLogic {
    public static handlePush(payload: SixpointPushPayload): void {
        const model = GameApp.Interface.GetModel(SixpointModel);
        const tid = model.tidKey.value;
        if (payload.tid_key && tid && payload.tid_key !== tid) {
            return;
        }
        const kind = payload.kind ?? "";
        switch (kind) {
            case SixpointPushKind.NotifyBet:
                if (payload.state != null) {
                    model.gameState = payload.state;
                }
                if (payload.cd != null) {
                    model.gameCd = payload.cd;
                }
                GameApp.Interface.SendEvent(new SixpointPhaseBetEvent(payload.cd ?? 0));
                break;
            case SixpointPushKind.NotifyCommitRest:
                if (payload.state != null) {
                    model.gameState = payload.state;
                }
                if (payload.cd != null) {
                    model.gameCd = payload.cd;
                }
                GameApp.Interface.SendEvent(new SixpointPhaseRestEvent(payload.cd ?? 0));
                break;
            case SixpointPushKind.PerSecondBetInfo:
            case SixpointPushKind.BetBc:
                if (payload.betAreaInfo) {
                    model.applyBetAreas(payload.betAreaInfo);
                    GameApp.Interface.SendEvent(new SixpointBetAreasUpdatedEvent(payload.betAreaInfo));
                }
                if (payload.money != null && model.table.value) {
                    model.applyTable({ ...model.table.value, money: payload.money });
                }
                if (payload.seatid != null && model.table.value) {
                    model.applyTable({ ...model.table.value, seatid: payload.seatid });
                }
                break;
            case SixpointPushKind.RollResult:
                if (payload.state != null) {
                    model.gameState = payload.state;
                }
                if (payload.pointinfo) {
                    if (model.historyRecord.length < 6) {
                        model.historyRecord = [[], [], [], [], [], []];
                    }
                    for (let i = 0; i < 6; i++) {
                        model.historyRecord[i].push(payload.pointinfo[i] ?? 0);
                    }
                }
                if (payload.money != null && model.table.value) {
                    model.applyTable({ ...model.table.value, money: payload.money });
                }
                GameApp.Interface.SendEvent(new SixpointRollResultEvent(payload));
                break;
            case SixpointPushKind.OnlineCount:
                if (payload.count != null) {
                    GameApp.Interface.SendEvent(new SixpointOnlineCountEvent(payload.count));
                }
                break;
            case SixpointPushKind.SitDownBc:
            case SixpointPushKind.StandUpBc:
                if (model.table.value) {
                    const rich = (payload as { rich_players?: Record<string, unknown>[] }).rich_players;
                    if (rich) {
                        model.applyTable({ ...model.table.value, rich_players: rich });
                        GameApp.Interface.SendEvent(new SixpointRichPlayersEvent(rich));
                    }
                }
                break;
            case SixpointPushKind.ChatBc:
                if (payload.msg) {
                    GameApp.Interface.SendEvent(
                        new SixpointChatPushEvent(payload.uid ?? 0, payload.msg, payload.seatid),
                    );
                }
                break;
            case SixpointPushKind.FaceBc:
            case SixpointPushKind.EmotionBc:
                break;
            default:
                break;
        }
    }

    public static bindPush(): void {
        GameApp.Interface.RegisterEvent(SixpointPushEvent, (e) => {
            SixpointGameLogic.handlePush(e.payload);
        });
    }

    public static requestResync(): void {
        GameApp.Interface.SendCommand(new SixpointSyncTableCommand());
    }
}

import { GameApp } from "../../../../../script/game/GameApp";
import { RummyPushKind, RummyTablePushPayload } from "./config/RummyProtocol";
import {
    RummyDiscardEvent,
    RummyGameStartEvent,
    RummyHandCardsEvent,
    RummyHandEndEvent,
    RummyPickEvent,
    RummyPushEvent,
    RummyTableUpdatedEvent,
    RummyTurnEvent,
} from "./event/RummyEvents";
import { RummyModel } from "./model/RummyModel";

export class RummyGameLogic {
    public static handlePush(payload: RummyTablePushPayload): void {
        const model = GameApp.Interface.GetModel(RummyModel);
        const tid = model.tidKey;
        if (payload.tid_key && tid && payload.tid_key !== tid) {
            return;
        }
        GameApp.Interface.SendEvent(new RummyPushEvent(payload));
        const kind = payload.kind ?? "";
        if (kind === RummyPushKind.MyCards && payload.cards) {
            model.applyMyCards(payload.cards);
            GameApp.Interface.SendEvent(new RummyHandCardsEvent(payload.cards));
            return;
        }
        if (kind) {
            model.applyPush(payload);
            GameApp.Interface.SendEvent(new RummyTableUpdatedEvent(payload));
        }
        switch (kind) {
            case RummyPushKind.GameStart:
                GameApp.Interface.SendEvent(new RummyGameStartEvent(payload.hand_no ?? 0));
                break;
            case RummyPushKind.PickBc:
                GameApp.Interface.SendEvent(new RummyPickEvent(payload.uid ?? 0, payload.from ?? ""));
                break;
            case RummyPushKind.DiscardBc:
                GameApp.Interface.SendEvent(
                    new RummyDiscardEvent(payload.uid ?? 0, payload.card?.id ?? 0),
                );
                break;
            case RummyPushKind.NotifyTurn:
                GameApp.Interface.SendEvent(
                    new RummyTurnEvent(payload.cd ?? 0, payload.turn_uid ?? 0),
                );
                break;
            case RummyPushKind.GameEnd:
                GameApp.Interface.SendEvent(
                    new RummyHandEndEvent(payload.winner ?? 0, payload.penalties ?? {}),
                );
                break;
            default:
                break;
        }
    }

    public static bindPush(): void {
        /* registered via RummySubscribePushCommand */
    }
}

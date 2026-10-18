import { RummyTablePushPayload } from "../config/RummyProtocol";

export class RummyPushEvent {
    public constructor(public readonly payload: RummyTablePushPayload) {}
}

export class RummyTableUpdatedEvent {
    public constructor(public readonly payload: RummyTablePushPayload) {}
}

export class RummyHandCardsEvent {
    public constructor(public readonly cards: import("../config/RummyProtocol").RummyCardDto[]) {}
}

export class RummyTurnEvent {
    public constructor(public readonly cd: number, public readonly turnUid: number) {}
}

export class RummyHandEndEvent {
    public constructor(
        public readonly winner: number,
        public readonly penalties: Record<string, number>,
    ) {}
}

export class RummyMoneyLessEvent {}

export class RummyPickEvent {
    public constructor(public readonly uid: number, public readonly from: string) {}
}

export class RummyDiscardEvent {
    public constructor(public readonly uid: number, public readonly cardId: number) {}
}

export class RummyGameStartEvent {
    public constructor(public readonly handNo: number) {}
}

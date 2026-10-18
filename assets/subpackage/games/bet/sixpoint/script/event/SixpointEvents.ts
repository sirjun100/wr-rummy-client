import { SixpointPushPayload } from "../config/SixpointProtocol";

export class SixpointPushEvent {
    public constructor(public readonly payload: SixpointPushPayload) {}
}

export class SixpointEnterReadyEvent {}

export class SixpointPhaseBetEvent {
    public constructor(public readonly cd: number) {}
}

export class SixpointPhaseRestEvent {
    public constructor(public readonly cd: number) {}
}

export class SixpointRollResultEvent {
    public constructor(public readonly payload: SixpointPushPayload) {}
}

export class SixpointBetAreasUpdatedEvent {
    public constructor(public readonly areas: import("../config/SixpointProtocol").BetAreaInfo[]) {}
}

export class SixpointOnlineCountEvent {
    public constructor(public readonly count: number) {}
}

export class SixpointMoneyLessEvent {
    public constructor(public readonly curBet: number) {}
}

export class SixpointRichPlayersEvent {
    public constructor(public readonly players: Record<string, unknown>[]) {}
}

export class SixpointChatPushEvent {
    public constructor(
        public readonly uid: number,
        public readonly msg: string,
        public readonly seatid?: number,
    ) {}
}

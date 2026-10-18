import { RocketPushPayload } from "../config/RocketProtocol";

export class RocketTableUpdatedEvent {
    constructor(public readonly dto: Record<string, unknown>) {}
}

export class RocketCrashPushEvent {
    constructor(public readonly payload: RocketPushPayload) {}
}

export class RocketEnterReadyEvent {}

export class RocketPlayersPageEvent {
    constructor(public readonly data: Record<string, unknown>) {}
}

export class RocketJackpotListEvent {
    constructor(public readonly data: { list?: unknown[]; last_times?: number }) {}
}

export class RocketPhaseBetEvent {
    constructor(public readonly cd: number, public readonly totalCd: number) {}
}

export class RocketPhaseFlyEvent {}

export class RocketPhaseEndEvent {
    constructor(public readonly winRate: number, public readonly playAnim: boolean) {}
}

export class RocketWinRateTickEvent {
    constructor(public readonly winRate: number) {}
}

export class RocketBtStateUpdatedEvent {
    constructor(
        public readonly btState: number[],
        public readonly ext: Record<string, unknown>,
    ) {}
}

export class RocketMoneyLessEvent {
    constructor(public readonly minEntry: number) {}
}

export class RocketSomeoneCashOutEvent {
    constructor(public readonly payload: Record<string, unknown>) {}
}

export class RocketSomeoneBetEvent {
    constructor(public readonly payload: Record<string, unknown>) {}
}

export class RocketOnlineCountEvent {
    constructor(public readonly count: number) {}
}

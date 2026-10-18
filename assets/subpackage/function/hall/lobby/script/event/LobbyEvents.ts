import type { HallHomeDto } from "../config/LobbyProtocol";

export class LobbyHomeReadyEvent {
    constructor(public readonly home: HallHomeDto) {}
}

export class LobbyTabChangedEvent {
    constructor(public readonly tabIndex: number) {}
}

/** Legacy PushEvent.updateActCollectOpen parity. */
export class UpdateActCollectOpenEvent {
    constructor(public readonly home: HallHomeDto) {}
}

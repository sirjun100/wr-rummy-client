export class InboxUnreadChangedEvent {
    constructor(public readonly count: number) {}
}

export class PromotionsRedChangedEvent {
    constructor(public readonly red: number) {}
}

export class WholeDayPageReadyEvent {}
export class WholeDayPageFetchFailedEvent {
    public constructor(public readonly message: string) {}
}
export class WholeDayPurchaseSuccessEvent {
    public constructor(public readonly msg: string) {}
}
export class WholeDayPurchaseFailedEvent {
    public constructor(public readonly message: string) {}
}

export class ConsecutivePageReadyEvent {}
export class ConsecutivePageFetchFailedEvent {
    public constructor(public readonly message: string) {}
}
export class ConsecutivePurchaseSuccessEvent {
    public constructor(public readonly msg: string) {}
}
export class ConsecutivePurchaseFailedEvent {
    public constructor(public readonly message: string) {}
}

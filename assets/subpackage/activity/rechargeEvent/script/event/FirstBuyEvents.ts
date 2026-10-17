export class FirstBuyPageReadyEvent {}
export class FirstBuyPageFetchFailedEvent {
    public constructor(public readonly message: string) {}
}
export class FirstBuyPurchaseSuccessEvent {
    public constructor(public readonly msg: string) {}
}
export class FirstBuyPurchaseFailedEvent {
    public constructor(public readonly message: string) {}
}

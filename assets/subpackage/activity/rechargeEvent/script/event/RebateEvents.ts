export class RebatePageReadyEvent {}
export class RebatePageFetchFailedEvent {
    public constructor(public readonly message: string) {}
}
export class RebatePurchaseSuccessEvent {
    public constructor(public readonly msg: string) {}
}
export class RebatePurchaseFailedEvent {
    public constructor(public readonly message: string) {}
}

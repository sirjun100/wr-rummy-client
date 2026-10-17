export class RestartGiftPageReadyEvent {}
export class RestartGiftPageFetchFailedEvent {
    public constructor(public readonly message: string) {}
}
export class RestartGiftActionSuccessEvent {
    public constructor(public readonly msg: string) {}
}
export class RestartGiftActionFailedEvent {
    public constructor(public readonly message: string) {}
}

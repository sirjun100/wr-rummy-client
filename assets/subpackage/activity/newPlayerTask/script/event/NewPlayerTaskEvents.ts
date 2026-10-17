import { NewPlayerTaskClaimRes } from "../config/NewPlayerTaskConfig";

export class NewPlayerTaskPageFetchFailedEvent {
    public constructor(public readonly message: string) {}
}

export class NewPlayerTaskClaimSuccessEvent {
    public constructor(public readonly res: NewPlayerTaskClaimRes) {}
}

export class NewPlayerTaskClaimFailedEvent {
    public constructor(public readonly message: string) {}
}

export class NewPlayerTaskPageReadyEvent {
    public constructor(public readonly vid: number) {}
}

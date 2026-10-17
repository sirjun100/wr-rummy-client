import { DailyCheckinClaimRes } from "../config/DailyCheckinConfig";

export class DailyCheckinFetchFailedEvent {
    public constructor(public readonly message: string) {}
}

export class DailyCheckinClaimSuccessEvent {
    public constructor(public readonly result: DailyCheckinClaimRes) {}
}

export class DailyCheckinClaimFailedEvent {
    public constructor(public readonly message: string) {}
}

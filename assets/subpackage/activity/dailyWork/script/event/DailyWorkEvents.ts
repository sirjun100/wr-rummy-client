import { DailyWorkClaimRes } from "../config/DailyWorkConfig";

export class DailyWorkFetchFailedEvent {
    public constructor(public readonly message: string) {}
}

export class DailyWorkClaimSuccessEvent {
    public constructor(public readonly res: DailyWorkClaimRes) {}
}

export class DailyWorkClaimFailedEvent {
    public constructor(public readonly message: string) {}
}

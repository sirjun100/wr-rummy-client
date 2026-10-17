import {
    BeginnerFlipClaimRes,
    BeginnerFlipPageDto,
} from "../config/BeginnerFlipTaskConfig";

export class BeginnerFlipPageFetchFailedEvent {
    public constructor(public readonly message: string) {}
}

export class BeginnerFlipRecordsFetchFailedEvent {
    public constructor(public readonly message: string) {}
}

export class BeginnerFlipClaimSuccessEvent {
    public constructor(public readonly result: BeginnerFlipClaimRes) {}
}

export class BeginnerFlipClaimFailedEvent {
    public constructor(public readonly message: string) {}
}

export class BeginnerFlipCheckReadyEvent {
    public constructor(
        public readonly taskId: number,
        public readonly taskData: BeginnerFlipPageDto,
        public readonly vid: string,
        public readonly tidKey: string,
    ) {}
}

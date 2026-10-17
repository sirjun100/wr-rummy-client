import {
    EarthquakesChipCheckRes,
    EarthquakesChipClaimRes,
    EarthquakesTaskDto,
} from "../config/EarthquakesConfig";

export class EarthquakesPageFetchFailedEvent {
    public constructor(public readonly message: string) {}
}

export class EarthquakesTaskFetchFailedEvent {
    public constructor(public readonly message: string) {}
}

export class EarthquakesRankFetchFailedEvent {
    public constructor(public readonly message: string) {}
}

export class EarthquakesChipClaimSuccessEvent {
    public constructor(public readonly res: EarthquakesChipClaimRes) {}
}

export class EarthquakesChipClaimFailedEvent {
    public constructor(public readonly message: string) {}
}

export class EarthquakesChipCheckReadyEvent {
    public constructor(
        public readonly res: EarthquakesChipCheckRes,
        public readonly task: EarthquakesTaskDto,
        public readonly vid: number,
        public readonly player: number,
    ) {}
}

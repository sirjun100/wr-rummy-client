import { WeeklyMonthCardPageDto, WeeklyMonthCardRewardDto } from "../config/WeeklyMonthCardConfig";

export class WeeklyMonthCardPageReadyEvent {
    public constructor(public readonly vid: number = 0) {}
}

export class WeeklyMonthCardPageFetchFailedEvent {
    public constructor(public readonly message: string) {}
}

export class WeeklyMonthCardTipsReadyEvent {}

export class WeeklyMonthCardTipsFetchFailedEvent {
    public constructor(public readonly message: string) {}
}

export class WeeklyMonthCardPurchaseSuccessEvent {
    public constructor(
        public readonly msg: string,
        public readonly reward: WeeklyMonthCardRewardDto[],
        public readonly page: WeeklyMonthCardPageDto | null,
    ) {}
}

export class WeeklyMonthCardPurchaseFailedEvent {
    public constructor(public readonly message: string) {}
}

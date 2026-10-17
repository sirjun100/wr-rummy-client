import { PayOneForThreeClaimRes, PayOneForThreePageDto } from "../config/PayOneForThreeConfig";

export class PayOneForThreePageFetchFailedEvent {
    public constructor(public readonly message: string) {}
}

export class PayOneForThreeClaimSuccessEvent {
    public constructor(public readonly res: PayOneForThreeClaimRes) {}
}

export class PayOneForThreeClaimFailedEvent {
    public constructor(public readonly message: string) {}
}

export class PayOneForThreePurchaseSuccessEvent {
    public constructor(public readonly page: PayOneForThreePageDto) {}
}

export class PayOneForThreePurchaseFailedEvent {
    public constructor(public readonly message: string) {}
}

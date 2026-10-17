import { PiggyBankPurchaseRes } from "../config/PiggyBankConfig";

export class PiggyBankPageFetchFailedEvent {
    public constructor(public readonly message: string) {}
}

export class PiggyBankPurchaseSuccessEvent {
    public constructor(public readonly res: PiggyBankPurchaseRes) {}
}

export class PiggyBankPurchaseFailedEvent {
    public constructor(public readonly message: string) {}
}

export class PiggyBankPageReadyEvent {
    public constructor(public readonly vid: number) {}
}

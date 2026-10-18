import { WalletSnapshotDto } from "../../model/WalletModel";

export class ShopRechargeSuccessEvent {
    public constructor(public readonly wallet?: WalletSnapshotDto) {}
}

export class ShopRechargeFailedEvent {
    public constructor(public readonly message: string) {}
}

export class WithdrawSubmittedEvent {
    public constructor(public readonly orderId: number) {}
}

export class KycUpdatedEvent {}

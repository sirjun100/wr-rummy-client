import { BindableProperty } from "../../framework/QFramework";
import { AbstractModel } from "../../framework/QFramework";

export type WalletSnapshotDto = {
    deposit?: number;
    winnings?: number;
    bonus?: number;
    withdrawable?: number;
    pay_total?: number;
    kyc_check?: number;
    shop_open?: number;
    balance?: number;
};

export class WalletModel extends AbstractModel {
    public readonly snapshot = new BindableProperty<WalletSnapshotDto>({});

    protected OnInit(): void {}

    public apply(dto: WalletSnapshotDto): void {
        this.snapshot.value = { ...dto };
    }

    public clear(): void {
        this.snapshot.value = {};
    }
}

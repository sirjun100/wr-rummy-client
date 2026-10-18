import { BindableProperty } from "../../framework/QFramework";
import { AbstractModel } from "../../framework/QFramework";
import {
    FastBuyPageDto,
    KycPageDto,
    LedgerEntryDto,
    MembershipPageDto,
    ProfileDto,
    ShopPageDto,
    WithdrawOrderDto,
    WithdrawPageDto,
} from "../config/PaymentProtocol";

export class PaymentModel extends AbstractModel {
    public readonly shopPage = new BindableProperty<ShopPageDto>({});
    public readonly fastBuyPage = new BindableProperty<FastBuyPageDto>({});
    public readonly withdrawPage = new BindableProperty<WithdrawPageDto>({});
    public readonly withdrawList = new BindableProperty<WithdrawOrderDto[]>([]);
    public readonly ledgerList = new BindableProperty<LedgerEntryDto[]>([]);
    public readonly ledgerDetail = new BindableProperty<LedgerEntryDto>({});
    public readonly kycPage = new BindableProperty<KycPageDto>({});
    public readonly membershipPage = new BindableProperty<MembershipPageDto>({});
    public readonly profile = new BindableProperty<ProfileDto>({});

    protected OnInit(): void {}
}

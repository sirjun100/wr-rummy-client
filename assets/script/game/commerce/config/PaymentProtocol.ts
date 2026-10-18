import { IUIData } from "../../framework/toolkits/uiKit/UIKit";
import { WalletSnapshotDto } from "../../model/WalletModel";

export type ShopSkuDto = {
    id?: number;
    money?: number;
    rate?: string;
    reward_list?: { type?: number; amt?: string; num?: number }[];
    bonus_pct?: number;
};

export type ShopPageDto = {
    list?: ShopSkuDto[];
    channels?: { id?: number; name?: string; type?: string; enabled?: boolean }[];
    coupon_list?: { id?: number; title?: string; amount?: number }[];
    retain_seconds?: number;
    kyc_gate?: boolean;
};

export type FastBuyPageDto = {
    good_list?: ShopSkuDto[];
    check_kyc?: number;
    default_channel_id?: number;
};

export type CodeRes = { code?: number };

export type WalletSnapshotRes = { code?: number; wallet?: WalletSnapshotDto };
export type ShopListRes = { code?: number; shop_data?: ShopPageDto };
export type FastBuyRes = { code?: number; data?: FastBuyPageDto };

export type CreateOrderRes = {
    code?: number;
    data?: {
        recharge_id?: string;
        price?: number;
        test_pay?: boolean;
        channel_payload?: string;
        client_order_id?: string;
    };
};

export type ConfirmOrderRes = {
    code?: number;
    data?: { wallet?: WalletSnapshotDto; ledger_id?: number };
};

export type LedgerEntryDto = {
    id?: number;
    type?: string;
    amount?: number;
    status?: string;
    created_at?: number;
    title?: string;
    detail?: string;
    timeline?: string[];
};

export type LedgerListRes = {
    code?: number;
    data?: { list?: LedgerEntryDto[]; last_id?: number; has_next?: boolean };
};

export type LedgerOneRes = { code?: number; data?: LedgerEntryDto };

export type WithdrawPageDto = {
    withdrawable?: number;
    min_amount?: number;
    max_amount?: number;
    fee_pct?: number;
    daily_left?: number;
    accounts?: PayoutAccountDto[];
    kyc_check?: number;
};

export type PayoutAccountDto = {
    id?: number;
    w_type?: number;
    bank_name?: string;
    account_no?: string;
    upi_id?: string;
    is_default?: boolean;
};

export type WithdrawPageRes = { code?: number; data?: WithdrawPageDto };
export type WithdrawSubmitRes = { code?: number; data?: { id?: number; amount?: number; status?: string; process?: string[] } };
export type WithdrawOrderDto = {
    id?: number;
    amount?: number;
    status?: string;
    process?: string[];
    created_at?: number;
};

export type WithdrawListRes = { code?: number; list?: WithdrawOrderDto[] };

export type ProfileDto = {
    tel_no?: string;
    email?: string;
    gender?: number;
    birth?: string;
    name?: string;
};

export type ProfileGetRes = { code?: number; profile?: ProfileDto };

export type KycPageDto = {
    form_list?: string[];
    kyc_list?: Record<string, string>;
    kyc_check?: number;
    card_check?: number;
};

export type KycPageRes = { code?: number; data?: KycPageDto };
export type MembershipPageDto = {
    level?: number;
    withdraw_count?: number;
    daily_withdraw?: number;
    next_level_need?: number;
};
export type MembershipPageRes = { code?: number; data?: MembershipPageDto };

export class ShopOpenData implements IUIData {
    public constructor(
        public readonly exe?: Record<string, unknown>,
        public readonly scene: number = 1,
        public readonly vid: number = 0,
    ) {}
}

export class FastBuyOpenData implements IUIData {
    public constructor(
        public readonly context: "hall" | "game" = "hall",
        public readonly vid: number = 0,
        public readonly inRoom: number = 0,
        public readonly checkKyc: number = 0,
        public readonly minEntry?: number,
        public readonly tidKey?: string,
        public readonly autoQuick?: number,
    ) {}
}

export class LedgerOpenData implements IUIData {
    public constructor(public readonly initialType: number = 0) {}
}

export class LedgerDetailOpenData implements IUIData {
    public constructor(public readonly ledgerId: number) {}
}

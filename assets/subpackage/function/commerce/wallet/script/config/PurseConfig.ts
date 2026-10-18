export const PurseWType = {
    Bank: 1,
    Upi: 4,
} as const;

export const PurseI18n = {
    walletHelp:
        "Deposit adds to playable balance. Winnings can be withdrawn after KYC. Bonus has usage rules per promotion.",
    shopClosed: "Recharge unavailable",
    withdrawBlocked: "Withdraw unavailable",
    kycRequired: "Please complete KYC first",
} as const;

export const LedgerPreviewCount = 3;

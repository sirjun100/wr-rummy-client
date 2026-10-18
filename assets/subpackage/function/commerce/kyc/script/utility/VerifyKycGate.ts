import { GameApp } from "../../../../../script/game/GameApp";
import type { KycPageDto } from "../../../../../script/game/commerce/config/PaymentProtocol";
import type { WalletSnapshotDto } from "../../../../../script/game/model/WalletModel";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { VerifyI18n } from "../config/VerifyConfig";
import { openKycPhoto } from "../VerifyModule";

export function isKycVerified(kycCheck?: number): boolean {
    return kycCheck === 2;
}

export function needsKycForShop(snap: WalletSnapshotDto, page: { kyc_gate?: boolean }): boolean {
    return Boolean(page.kyc_gate) && !isKycVerified(snap.kyc_check);
}

export function needsKycForFastBuy(checkKyc: number, snap: WalletSnapshotDto): boolean {
    return checkKyc === 1 && !isKycVerified(snap.kyc_check);
}

export function needsKycForWithdraw(page: { kyc_check?: number }): boolean {
    return !isKycVerified(page.kyc_check);
}

/** Opens KYC dialog when not verified. Returns true if caller may continue. */
export async function promptKycIfNeeded(
    kycCheck?: number,
    toastMessage: string = VerifyI18n.kycRequired,
): Promise<boolean> {
    if (isKycVerified(kycCheck)) {
        return true;
    }
    GameApp.Interface.GetSystem(UISystem).showToast(toastMessage);
    await openKycPhoto();
    return false;
}

export async function promptKycFromPage(page: KycPageDto): Promise<boolean> {
    return promptKycIfNeeded(page.kyc_check);
}

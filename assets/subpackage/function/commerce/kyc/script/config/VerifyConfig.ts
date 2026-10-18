export const VerifyOtpCooldownSec = 60;

export const VerifyI18n = {
    kycRequired: "Complete KYC to continue",
    kycVerified: "KYC verified",
    kycPending: "KYC pending review",
    kycSubmitEmpty: "Please enter your name",
    kycSubmitOk: "KYC submitted",
    kycSubmitFail: "KYC submit failed",
    bindOtpSent: "OTP sent",
    bindOtpFail: "Failed to send OTP",
    bindOk: "Updated successfully",
    bindFail: "Invalid OTP or value",
    bindValueEmpty: "Enter phone or email",
    bindOtpEmpty: "Enter OTP",
    documentUploadP2: "Document upload coming soon",
    resubmitP2: "KYC resubmit coming soon",
} as const;

export function kycStatusLabel(kycCheck?: number): string {
    if (kycCheck === 2) {
        return VerifyI18n.kycVerified;
    }
    if (kycCheck === 1) {
        return VerifyI18n.kycPending;
    }
    return VerifyI18n.kycRequired;
}

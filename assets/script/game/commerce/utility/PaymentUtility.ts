import { IUtility } from "../../framework/QFramework";
import { Utility } from "../../utility/Utility";

export class PaymentUtility implements IUtility {
    public formatMoney(amount: number | undefined): string {
        if (amount === undefined || amount === null) {
            return "₹0";
        }
        return `₹${Utility.format.money(amount)}`;
    }

    public needsKyc(kycCheck: number | undefined, kycGate: boolean | undefined): boolean {
        if (!kycGate) {
            return false;
        }
        return kycCheck !== 2;
    }
}

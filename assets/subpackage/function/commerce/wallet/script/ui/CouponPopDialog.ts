import { _decorator, Label } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { PaymentModel } from "../../../../../script/game/commerce/model/PaymentModel";
import { PurseUiModel } from "../model/PurseUiModel";
import { PaymentDialogBase } from "./PaymentDialogBase";
import { ensurePurseRegistered } from "../PurseModule";

const { ccclass, property } = _decorator;

@ccclass("CouponPopDialog")
export class CouponPopDialog extends PaymentDialogBase {
    @property(Label)
    public titleLabel: Label = null;

    protected OnInit(): void {
        ensurePurseRegistered();
        const coupons = GameApp.Interface.GetModel(PaymentModel).shopPage.value.coupon_list ?? [];
        if (this.titleLabel && coupons[0]) {
            this.titleLabel.string = coupons[0].title ?? "";
        }
        coupons.forEach((c, i) => {
            this.wireByName(`coupon_${i}`, () => {
                GameApp.Interface.GetModel(PurseUiModel).selectedCouponId.value = c.id ?? 0;
                this.CloseSelf();
            });
        });
        this.wireByName("btn_close", () => this.CloseSelf());
    }

    protected OnClose(): void {}
}

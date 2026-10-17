import { _decorator, Button, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { CouponPackageDto, RechargeOpenData } from "../config/RechargeEventConfig";

const { ccclass, property } = _decorator;

@ccclass("CouponPackageDialog")
export class CouponPackageDialog extends BaseDialog {
    @property(Node)
    public bgView: Node = null;

    private openData = new RechargeOpenData();
    private couponData: CouponPackageDto | null = null;

    protected OnInit(uiData: RechargeOpenData = null): void {
        if (uiData) {
            this.openData = uiData;
            this.couponData = (uiData.initialExt as CouponPackageDto) ?? null;
        }
        this.applyCoupon();
        this.wireButtons();
    }

    protected OnClose(): void {}

    private applyCoupon(): void {
        const info = this.couponData?.coupon_info;
        const cur = this.bgView?.getChildByName("cur_coupon");
        if (!cur || !info) {
            return;
        }
        cur.getChildByName("type_wz")?.getComponent(Label)?.string = String(info.rate_text ?? "");
        cur.getChildByName("title_wz")?.getComponent(Label)?.string = String(info.content ?? "");
        this.bgView?.getChildByName("flag")?.getComponent(Label)?.string = String(info.content ?? "");
        if (info.coupon_code) {
            const kuang = cur.getChildByName("kuang");
            kuang?.active = true;
            cur.getChildByName("kuang_img")?.active = true;
            kuang?.getChildByName("title_wz")?.getComponent(Label)?.string = info.coupon_code;
        }
        cur.getChildByName("date_ez")?.getComponent(Label)?.string = String(info.expire_text ?? "");
    }

    private wireButtons(): void {
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("add_cash", () => {
            GameApp.Interface.GetSystem(UISystem).showToast("Store (P1)");
            this.CloseSelf();
        });
    }

    private wireByName(name: string, fn: () => void): void {
        const stack: Node[] = [this.node];
        while (stack.length) {
            const n = stack.pop()!;
            if (n.name === name && n.getComponent(Button)) {
                n.off(Button.EventType.CLICK);
                n.on(Button.EventType.CLICK, () => {
                    GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
                    fn();
                }, this);
            }
            for (const c of n.children) {
                stack.push(c);
            }
        }
    }
}

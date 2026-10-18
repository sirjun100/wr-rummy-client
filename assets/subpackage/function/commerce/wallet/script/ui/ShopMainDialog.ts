import { _decorator, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { WalletModel } from "../../../../../script/game/model/WalletModel";
import { FetchShopListCommand } from "../../../../../script/game/commerce/command/FetchShopListCommand";
import { StartShopPurchaseCommand } from "../../../../../script/game/commerce/command/StartShopPurchaseCommand";
import { ShopOpenData } from "../../../../../script/game/commerce/config/PaymentProtocol";
import { ShopRechargeFailedEvent, ShopRechargeSuccessEvent } from "../../../../../script/game/commerce/event/PaymentEvents";
import { PaymentModel } from "../../../../../script/game/commerce/model/PaymentModel";
import { PurseUiModel } from "../model/PurseUiModel";
import { PurseI18n } from "../config/PurseConfig";
import { bindShopSkuGrid } from "../controller/ShopSkuGridBinder";
import { PaymentDialogBase } from "./PaymentDialogBase";
import { ensurePurseRegistered, openPaymentSelect, openShopRetain, openKycPhoto, openCouponPop } from "../PurseModule";

const { ccclass, property } = _decorator;

@ccclass("ShopMain")
export class ShopMainDialog extends PaymentDialogBase {
    @property(Node)
    public rootNode: Node = null;

    private openData = new ShopOpenData();
    private readonly uiModel = () => GameApp.Interface.GetModel(PurseUiModel);

    protected OnInit(uiData: ShopOpenData = null): void {
        ensurePurseRegistered();
        if (uiData) {
            this.openData = uiData;
        }
        const exe = this.openData.exe ? JSON.stringify(this.openData.exe) : "";
        GameApp.Interface.SendCommand(new FetchShopListCommand(exe));
        GameApp.Interface.RegisterEvent(ShopRechargeSuccessEvent, () => this.CloseSelf(), this).UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(ShopRechargeFailedEvent, (e) => {
            GameApp.Interface.GetSystem(UISystem).showToast(e.message ?? "Pay failed");
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.GetModel(PaymentModel).shopPage.RegisterWithInitValue((p) => this.applyShop(p), this).UnRegisterWhenGameObjectDestroyed(this.node);
        this.wireByName("btn_close", () => void openShopRetain(() => this.CloseSelf()));
        this.wireByName("pay_btn", () => this.onPay());
        this.wireByName("coupon_btn", () => void openCouponPop());
    }

    protected OnClose(): void {}

    private applyShop(page: PaymentModel["shopPage"]["value"]): void {
        const list = page.list ?? [];
        const ui = this.uiModel();
        if (list.length > 0 && !ui.selectedSkuId.value) {
            ui.selectedSkuId.value = list[0].id ?? 0;
        }
        const ch = page.channels?.[0];
        if (ch?.id) {
            ui.selectedChannelId.value = ch.id;
        }
        bindShopSkuGrid(
            this.rootNode ?? this.node,
            list,
            ui.selectedSkuId.value,
            (id) => {
                ui.selectedSkuId.value = id;
                this.applyShop(page);
            },
            this,
        );
    }

    private onPay(): void {
        const sku = this.uiModel().selectedSkuId.value;
        const channel = this.uiModel().selectedChannelId.value;
        if (!sku) {
            return;
        }
        const snap = GameApp.Interface.GetModel(WalletModel).snapshot.value;
        const page = GameApp.Interface.GetModel(PaymentModel).shopPage.value;
        void import("../../kyc/script/utility/VerifyKycGate").then(async (g) => {
            if (g.needsKycForShop(snap, page)) {
                await g.promptKycIfNeeded(snap.kyc_check, PurseI18n.kycRequired);
                return;
            }
            void openPaymentSelect(sku, channel, this.openData.scene, this.openData.vid, false);
        });
    }

    public selectSku(id: number): void {
        this.uiModel().selectedSkuId.value = id;
    }

    public confirmPurchase(): void {
        const sku = this.uiModel().selectedSkuId.value;
        const channel = this.uiModel().selectedChannelId.value;
        GameApp.Interface.SendCommand(
            new StartShopPurchaseCommand(sku, channel, this.openData.scene, this.openData.vid, false),
        );
    }
}

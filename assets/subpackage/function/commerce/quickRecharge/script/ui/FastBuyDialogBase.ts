import { Button, Label, Node, Sprite, SpriteFrame } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import type { FastBuyOpenData, FastBuyPageDto, ShopSkuDto } from "../../../../../script/game/commerce/config/PaymentProtocol";
import { ShopRechargeSuccessEvent } from "../../../../../script/game/commerce/event/PaymentEvents";
import { PaymentModel } from "../../../../../script/game/commerce/model/PaymentModel";
import { PaymentDialogBase } from "../../wallet/script/ui/PaymentDialogBase";
import { openPaymentSelect } from "../../wallet/script/PurseModule";
import { WalletModel } from "../../../../../script/game/model/WalletModel";
import { PurseI18n } from "../../wallet/script/config/PurseConfig";
import { FastBuyNodeNames, FastBuyScene } from "../config/FastBuyConfig";
import { formatFastBuyMoney, mapRewardIconIndex, rewardAmountText } from "../utility/FastBuyRewardHelper";

export abstract class FastBuyDialogBase extends PaymentDialogBase {
    protected rootNode: Node | null = null;

    protected iconImgs: SpriteFrame[] = [];

    protected tabImgs: SpriteFrame[] = [];

    protected openData = new FastBuyOpenData();

    protected curTabIndex = 0;

    protected page: FastBuyPageDto = {};

    protected defaultChannelId = 1;

    protected OnInit(uiData: FastBuyOpenData = null): void {
        if (uiData) {
            this.openData = uiData;
        }
        this.resolveRoot();
        GameApp.Interface.GetModel(PaymentModel)
            .fastBuyPage.RegisterWithInitValue((p) => this.applyPage(p), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(ShopRechargeSuccessEvent, () => this.CloseSelf(), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        this.wireByName("close", () => this.onCloseClick());
        this.wireByName("btn_close", () => this.onCloseClick());
        this.wireByName(FastBuyNodeNames.OkBtn, () => this.onPay());
        for (let i = 0; i < FastBuyNodeNames.TabCount; i++) {
            const tab = this.findUnderRoot(`${FastBuyNodeNames.TabPrefix}${i}`);
            const btn = tab?.getComponent(Button);
            if (btn) {
                btn.node.on(Button.EventType.CLICK, () => this.selectTab(i), this);
            }
        }
    }

    protected OnClose(): void {}

    protected resolveRoot(): void {
        this.rootNode =
            this.node.getChildByName(FastBuyNodeNames.Root) ??
            this.node.getChildByName("rootNode") ??
            this.findDeep(this.node, FastBuyNodeNames.Root);
    }

    protected findUnderRoot(name: string): Node | null {
        if (!this.rootNode) {
            this.resolveRoot();
        }
        return this.rootNode?.getChildByName(name) ?? this.findDeep(this.rootNode ?? this.node, name);
    }

    private findDeep(root: Node | null, name: string): Node | null {
        if (!root) {
            return null;
        }
        if (root.name === name) {
            return root;
        }
        for (const c of root.children) {
            const hit = this.findDeep(c, name);
            if (hit) {
                return hit;
            }
        }
        return null;
    }

    protected applyPage(page: FastBuyPageDto): void {
        this.page = page ?? {};
        if (this.page.default_channel_id) {
            this.defaultChannelId = this.page.default_channel_id;
        }
        const list = this.page.good_list ?? [];
        for (let i = 0; i < FastBuyNodeNames.TabCount && i < list.length; i++) {
            const sku = list[i];
            const tab = this.findUnderRoot(`${FastBuyNodeNames.TabPrefix}${i}`);
            if (!tab || !sku) {
                continue;
            }
            const price = tab.getChildByName("price");
            const percent = tab.getChildByName("percent");
            if (price) {
                this.setLabel(price, formatFastBuyMoney(sku.money));
            }
            if (percent && sku.rate) {
                this.setLabel(percent, `+${sku.rate}`);
            }
        }
        this.updateTabContent();
    }

    protected abstract styleTabSelected(tab: Node, selected: boolean): void;

    protected updateTabContent(): void {
        const list = this.page.good_list ?? [];
        for (let i = 0; i < FastBuyNodeNames.TabCount; i++) {
            const tab = this.findUnderRoot(`${FastBuyNodeNames.TabPrefix}${i}`);
            if (tab) {
                this.styleTabSelected(tab, i === this.curTabIndex);
            }
        }
        const sku = list[this.curTabIndex];
        if (!sku || !this.rootNode) {
            return;
        }
        const okBtn = this.findUnderRoot(FastBuyNodeNames.OkBtn);
        if (okBtn) {
            const wz = okBtn.getChildByName("wz");
            if (wz) {
                this.setLabel(wz, formatFastBuyMoney(sku.money));
            }
            const flag = okBtn.getChildByName("flag");
            const flagLabel = flag?.getChildByName("Label");
            if (flagLabel && sku.rate) {
                this.setLabel(flagLabel, String(sku.rate));
            }
        }
        const content = this.findUnderRoot(FastBuyNodeNames.Content);
        if (content) {
            for (let e = 0; e < 2; e++) {
                const item = content.getChildByName(`${FastBuyNodeNames.ItemPrefix}${e}`);
                if (item) {
                    item.active = false;
                }
            }
            const rewards = sku.reward_list ?? [];
            for (let e = 0; e < rewards.length; e++) {
                this.updateRewardItem(rewards[e], content.getChildByName(`${FastBuyNodeNames.ItemPrefix}${e}`));
            }
        }
    }

    protected updateRewardItem(reward: { type?: number; amt?: string; num?: number }, item: Node | null): void {
        if (!item) {
            return;
        }
        item.active = true;
        const icon = item.getChildByName("icon");
        const idx = mapRewardIconIndex(reward.type);
        if (icon && this.iconImgs[idx]) {
            const sp = icon.getComponent(Sprite);
            if (sp) {
                sp.spriteFrame = this.iconImgs[idx];
            }
        }
        const num = item.getChildByName("num");
        if (num) {
            this.setLabel(num, rewardAmountText(reward));
        }
    }

    protected setLabel(node: Node, text: string): void {
        const lb = node.getComponent(Label);
        if (lb) {
            lb.string = text;
        }
    }

    protected selectTab(index: number): void {
        if (index === this.curTabIndex) {
            return;
        }
        this.curTabIndex = index;
        this.updateTabContent();
    }

    protected onCloseClick(): void {
        this.CloseSelf();
    }

    protected onPay(): void {
        const list = this.page.good_list ?? [];
        const sku = list[this.curTabIndex] as ShopSkuDto | undefined;
        const skuId = sku?.id ?? 0;
        if (!skuId) {
            return;
        }
        const scene = this.openData.context === "game" ? FastBuyScene.InGame : FastBuyScene.Hall;
        const snap = GameApp.Interface.GetModel(WalletModel).snapshot.value;
        const checkKyc = this.openData.checkKyc === 1 || this.page.check_kyc === 1 ? 1 : 0;
        void import("../../kyc/script/utility/VerifyKycGate").then(async (g) => {
            if (g.needsKycForFastBuy(checkKyc, snap)) {
                await g.promptKycIfNeeded(snap.kyc_check, PurseI18n.kycRequired);
                return;
            }
            void openPaymentSelect(skuId, this.defaultChannelId, scene, this.openData.vid, true);
        });
    }
}

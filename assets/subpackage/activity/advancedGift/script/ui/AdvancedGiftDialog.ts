import { _decorator, Button, Label, Node, RichText, Sprite, SpriteFrame } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { I18NSystem } from "../../../../../script/game/system/I18NSystem";
import { PlatformSystem } from "../../../../../script/game/system/PlatformSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { Utility, UtilityTweenHandle } from "../../../../../script/game/utility/Utility";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { ClaimAdvancedGiftRewardCommand } from "../command/ClaimAdvancedGiftRewardCommand";
import { FetchAdvancedGiftPageCommand } from "../command/FetchAdvancedGiftPageCommand";
import { StartAdvancedGiftPayCommand } from "../command/StartAdvancedGiftPayCommand";
import {
    AdvancedGiftOpenData,
    AdvancedGiftPageDto,
    AdvancedGiftTierDto,
} from "../config/AdvancedGiftTypes";
import {
    AdvancedGiftClaimSuccessEvent,
    AdvancedGiftFetchFailedEvent,
} from "../event/AdvancedGiftEvents";
import { AdvancedGiftModel } from "../model/AdvancedGiftModel";

const { ccclass, property } = _decorator;

const TIER_LOCKED = 1;
const TIER_PURCHASED = 2;
const TIER_CLAIMABLE = 3;
const TIER_COLLECTED = 4;
const TIER_PAYABLE = 5;

@ccclass("AdvancedGiftDialog")
export class AdvancedGiftDialog extends BaseDialog {
    @property(Node)
    public rootNode: Node = null;

    @property(Node)
    public recordNode: Node = null;

    @property(Node)
    public mainNode: Node = null;

    @property(Label)
    public timeLabel: Label = null;

    @property(RichText)
    public tipsLabel: RichText = null;

    @property([SpriteFrame])
    public btnImags: SpriteFrame[] = [];

    @property([SpriteFrame])
    public itemBgs: SpriteFrame[] = [];

    @property(Node)
    public ruleNode: Node = null;

    private openData: AdvancedGiftOpenData = new AdvancedGiftOpenData();
    private leftTime = 0;
    private rule = "";
    private buyID = 0;
    private list: AdvancedGiftTierDto[] = [];
    private buyIndex = -1;
    private uiType = 0;
    private lastClick = 0;
    private linkId = 0;
    private reportScene = 1;
    private tickHandle: UtilityTweenHandle | null = null;
    private hasCharge = false;

    private get ui(): UISystem {
        return GameApp.Interface.GetSystem(UISystem);
    }

    protected OnInit(uiData: AdvancedGiftOpenData = null): void {
        if (uiData) {
            this.openData = uiData;
        }
        this.reportScene = this.openData.reportScene;
        this.linkId = this.openData.linkId > 0 ? this.openData.linkId : Date.now();
        this.ensureEditorRefs();
        if (this.recordNode) {
            this.recordNode.active = false;
        }
        this.wireButtons();
        this.registerEvents();

        const model = GameApp.Interface.GetModel(AdvancedGiftModel);
        if (this.openData.seedPage) {
            model.page.value = this.openData.seedPage;
        }
        GameApp.Interface.SendCommand(new FetchAdvancedGiftPageCommand(0));
        GameApp.Interface.GetSystem(PlatformSystem).reportAdvancedPack(this.reportScene, 2, this.linkId);
    }

    protected OnClose(): void {
        this.stopTick();
        this.ui.hideBlockingLoading();
    }

    /** Fallback when prefab fields are not wired in editor (names match AdvancedGiftDialog.prefab). */
    private ensureEditorRefs(): void {
        if (!Utility.node.isValid(this.node)) {
            return;
        }
        if (!this.rootNode) {
            this.rootNode = this.node.getChildByName("rootNode");
        }
        if (!this.mainNode && this.rootNode) {
            this.mainNode = this.rootNode.getChildByName("main");
        }
        if (!this.recordNode && this.rootNode) {
            this.recordNode = this.rootNode.getChildByName("rule");
        }
        if (!this.timeLabel && this.mainNode) {
            this.timeLabel = this.mainNode.getChildByName("time")?.getComponent(Label) ?? null;
        }
        if (!this.tipsLabel && this.mainNode) {
            this.tipsLabel = this.mainNode.getChildByName("tip")?.getComponent(RichText) ?? null;
        }
        if (!this.ruleNode && this.recordNode) {
            const content = this.recordNode.getChildByPath("bg/ScrollView/view/content");
            this.ruleNode = content?.getChildByName("tips") ?? null;
        }
    }

    private wireButtons(): void {
        const close = this.mainNode?.getChildByName("btn_close");
        close?.on(Button.EventType.CLICK, () => this.onCloseClick(), this);
        const help = this.mainNode?.getChildByName("btn_help");
        help?.on(Button.EventType.CLICK, () => this.showHelp(), this);
        if (this.recordNode) {
            const ruleClose = this.recordNode.getChildByPath("bg/top_root/close_btn");
            ruleClose?.on(Button.EventType.CLICK, () => this.hideHelp(), this);
        }
        for (let i = 0; i < 6; i++) {
            const gift = this.mainNode?.getChildByName(`gift${i}`);
            const btn = gift?.getChildByName("Button");
            btn?.on(Button.EventType.CLICK, () => this.onGiftClick(i), this);
        }
    }

    private registerEvents(): void {
        const model = GameApp.Interface.GetModel(AdvancedGiftModel);
        model.page
            .RegisterWithInitValue((page) => {
                if (page) {
                    if (page.reset != null) {
                        this.leftTime = Number(page.reset);
                    }
                    if (page.title) {
                        if (this.tipsLabel) {
                            this.tipsLabel.string = page.title;
                        }
                    }
                    if (page.rule) {
                        this.rule = page.rule;
                    }
                    if (page.buyID != null) {
                        this.buyID = page.buyID;
                    }
                    if (page.list) {
                        this.list = page.list;
                    }
                    if (page.ui_type != null) {
                        this.uiType = page.ui_type;
                        if (this.uiType === 1) {
                            this.hasCharge = false;
                        }
                    }
                    this.refreshMainUI();
                    this.startTick();
                }
            }, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(AdvancedGiftClaimSuccessEvent, this.onClaimSuccess, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(AdvancedGiftFetchFailedEvent, this.onFetchFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private onClaimSuccess(e: AdvancedGiftClaimSuccessEvent): void {
        this.ui.hideBlockingLoading();
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        const tips = e.tips?.length ? e.tips : i18n.getValueByKey("advancedPack.collect");
        LogKit.I("[AdvancedGiftDialog] claim ok tips={0}", tips);
    }

    private onFetchFailed(e: AdvancedGiftFetchFailedEvent): void {
        this.ui.hideBlockingLoading();
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        this.ui.showToast(i18n.getValueByKey("utlis.text6"));
        LogKit.W("[AdvancedGiftDialog] fetch failed {0}", e.message);
    }


    private refreshMainUI(): void {
        if (!this.mainNode) {
            return;
        }
        this.buyIndex = -1;
        for (let i = 0; i < this.list.length; i++) {
            const gift = this.mainNode.getChildByName(`gift${i}`);
            if (!gift) {
                continue;
            }
            gift.active = true;
            this.refreshGift(i, gift);
        }
        this.refreshLeftTime();
    }

    private refreshGift(index: number, gift: Node): void {
        const tier = this.list[index];
        if (!tier) {
            return;
        }
        if (tier.id === this.buyID) {
            this.buyIndex = index;
        }
        const status = tier.status;
        const money = Number(tier.money);
        const bmoney = Number(tier.bmoney);
        const bonus = Number(tier.bonus);
        const add = Number(tier.add);
        const all = tier.all;
        const jackpot = tier.jackpot;
        const i18n = GameApp.Interface.GetSystem(I18NSystem);

        const discount = gift.getChildByName("discount");
        const moneyLbl = gift.getChildByName("money")?.getComponent(Label);
        const reward = gift.getChildByName("reward");
        const cash = reward?.getChildByName("cash");
        const plus = reward?.getChildByName("plus");
        const bonusNode = reward?.getChildByName("bonus");
        const btn = gift.getChildByName("Button");
        const btnLbl = btn?.getChildByName("Label")?.getComponent(Label);
        const btnSprite = btn?.getComponent(Sprite);
        const valueLbl = discount?.getChildByName("value")?.getComponent(Label);
        const discountMask = discount?.getChildByName("mask");
        const rowMask = gift.getChildByName("mask");
        const lock = btn?.getChildByName("lock");
        const bg = gift.getChildByName("bg")?.getComponent(Sprite);

        if (jackpot === 1 && bg && this.itemBgs[1]) {
            bg.spriteFrame = this.itemBgs[1];
        }
        if (valueLbl) {
            valueLbl.string = String(add);
        }
        if (moneyLbl) {
            moneyLbl.string = `${all}`;
        }
        const cashLbl = cash?.getChildByName("wz")?.getComponent(Label);
        const bonusLbl = bonusNode?.getChildByName("wz")?.getComponent(Label);
        const moneyStr = (n: number) => `₹${Utility.format.money(n, { decimals: -1 })}`;
        if (cashLbl) {
            cashLbl.string = moneyStr(bmoney);
        }
        if (bonusLbl) {
            bonusLbl.string = moneyStr(bonus);
        }
        if (discount) {
            discount.active = add > 0;
            if (add > 0 && (status === TIER_CLAIMABLE || status === TIER_PAYABLE || status === TIER_LOCKED)) {
                Utility.ui.stopNodeTween(discount);
                Utility.tween.pulseScale(discount);
            }
        }
        if (cash && bonusNode && plus) {
            if (bmoney > 0 && bonus <= 0) {
                cash.active = true;
                bonusNode.active = false;
                plus.active = false;
            } else if (bmoney <= 0 && bonus > 0) {
                cash.active = false;
                bonusNode.active = true;
                plus.active = false;
            } else {
                cash.active = true;
                bonusNode.active = true;
                plus.active = true;
            }
        }
        if (lock) {
            lock.active = status === TIER_LOCKED;
        }
        if (!btn || !btnSprite || !btnLbl) {
            return;
        }
        btn.getComponent(Button)!.interactable = status === TIER_LOCKED || status === TIER_CLAIMABLE || status === TIER_PAYABLE;
        if (status === TIER_LOCKED) {
            btnSprite.spriteFrame = this.btnImags[1] ?? btnSprite.spriteFrame;
            btnLbl.string = money > 0 ? moneyStr(money) : i18n.getValueByKey("advancedPack.free");
            if (discountMask) discountMask.active = false;
            if (rowMask) rowMask.active = false;
        } else if (status === TIER_PURCHASED) {
            btn.getComponent(Button)!.interactable = false;
            btnSprite.spriteFrame = this.btnImags[2] ?? btnSprite.spriteFrame;
            btnLbl.string = i18n.getValueByKey("advancedPack.purchased");
            if (discountMask) discountMask.active = true;
            if (rowMask) rowMask.active = true;
        } else if (status === TIER_CLAIMABLE) {
            btnSprite.spriteFrame = this.btnImags[0] ?? btnSprite.spriteFrame;
            btnLbl.string =
                money > 0 ? i18n.getValueByKey("advancedPack.collect") : i18n.getValueByKey("advancedPack.free");
            if (discountMask) discountMask.active = false;
            if (rowMask) rowMask.active = false;
        } else if (status === TIER_COLLECTED) {
            btn.getComponent(Button)!.interactable = false;
            btnSprite.spriteFrame = this.btnImags[2] ?? btnSprite.spriteFrame;
            btnLbl.string = i18n.getValueByKey("advancedPack.collected");
            if (discountMask) discountMask.active = true;
            if (rowMask) rowMask.active = true;
        } else if (status === TIER_PAYABLE) {
            btnSprite.spriteFrame = this.btnImags[0] ?? btnSprite.spriteFrame;
            btnLbl.string = money > 0 ? moneyStr(money) : i18n.getValueByKey("advancedPack.free");
            if (discountMask) discountMask.active = false;
            if (rowMask) rowMask.active = false;
        }
    }

    private onGiftClick(index: number): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        const now = Date.now();
        if (now - this.lastClick < 1000) {
            return;
        }
        this.lastClick = now;
        const tier = this.list[index];
        if (!tier) {
            return;
        }
        const status = tier.status;
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        if (status === TIER_PAYABLE) {
            this.hasCharge = true;
            GameApp.Interface.GetSystem(PlatformSystem).reportAdvancedPack(this.reportScene, 5, this.linkId, {
                money: tier.money,
            });
            GameApp.Interface.SendCommand(
                new StartAdvancedGiftPayCommand(tier.id, tier.money, this.reportScene, this.linkId),
            );
        } else if (status === TIER_CLAIMABLE) {
            GameApp.Interface.GetSystem(PlatformSystem).reportAdvancedPack(this.reportScene, 6, this.linkId);
            this.ui.showBlockingLoading(10, () => {
                this.ui.showToast(i18n.getValueByKey("utlis.text6"));
            });
            GameApp.Interface.SendCommand(new ClaimAdvancedGiftRewardCommand());
        } else if (status === TIER_LOCKED) {
            this.ui.showToast(i18n.getValueByKey("advancedPack.unlock_tips"));
        }
    }

    private onCloseClick(): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        if (Utility.node.isValid(this.recordNode) && this.recordNode.active) {
            this.hideHelp();
            return;
        }
        GameApp.Interface.GetSystem(PlatformSystem).reportAdvancedPack(this.reportScene, 3, this.linkId);
        this.ui.hideToast();
        this.CloseSelf();
    }

    private showHelp(): void {
        if (!Utility.node.isValid(this.recordNode)) {
            return;
        }
        this.recordNode.active = true;
        this.updateRecordView();
    }

    private hideHelp(): void {
        if (Utility.node.isValid(this.recordNode)) {
            this.recordNode.active = false;
        }
    }

    private updateRecordView(): void {
        if (!this.rule || !Utility.node.isValid(this.ruleNode)) {
            return;
        }
        const label = this.ruleNode.getComponent(Label);
        if (label) {
            label.string = this.rule;
        }
    }

    private startTick(): void {
        this.stopTick();
        if (!Utility.node.isValid(this.node)) {
            return;
        }
        this.tickHandle = Utility.tween.scheduleRepeating(this.node, 1, () => this.onTick());
    }

    private stopTick(): void {
        Utility.tween.stop(this.tickHandle);
        this.tickHandle = null;
    }

    private onTick(): void {
        if (!Utility.node.isValid(this.node)) {
            this.stopTick();
            return;
        }
        this.leftTime -= 1;
        if (this.leftTime < 0) {
            this.leftTime = 0;
            this.stopTick();
            GameApp.Interface.SendCommand(new FetchAdvancedGiftPageCommand(0));
        }
        this.refreshLeftTime();
    }

    private refreshLeftTime(): void {
        if (!this.timeLabel) {
            return;
        }
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        const cd =
            this.leftTime <= 0
                ? "0m 0s"
                : Utility.time.durationShort(this.leftTime);
        this.timeLabel.string = Utility.format.template(i18n.getValueByKey("advancedPack.time"), cd);
    }
}

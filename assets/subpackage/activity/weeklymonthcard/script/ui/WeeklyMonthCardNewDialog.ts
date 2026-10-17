import { _decorator, Button, Label, Node, sp, v3 } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { ensureWeeklyMonthCardRegistered } from "../WeeklyMonthCardModule";
import { FetchWeeklyMonthCardPageCommand } from "../command/FetchWeeklyMonthCardPageCommand";
import { FetchWeeklyMonthCardTipsCommand } from "../command/FetchWeeklyMonthCardTipsCommand";
import { StartWeeklyMonthCardPurchaseCommand } from "../command/StartWeeklyMonthCardPurchaseCommand";
import {
    WeeklyMonthCardItemDto,
    WeeklyMonthCardOpenData,
    WeeklyMonthCardPageDto,
    WeeklyMonthCardRewardDto,
} from "../config/WeeklyMonthCardConfig";
import {
    WeeklyMonthCardPageFetchFailedEvent,
    WeeklyMonthCardPageReadyEvent,
    WeeklyMonthCardPurchaseFailedEvent,
    WeeklyMonthCardPurchaseSuccessEvent,
    WeeklyMonthCardTipsReadyEvent,
} from "../event/WeeklyMonthCardEvents";
import { WeeklyMonthCardModel } from "../model/WeeklyMonthCardModel";
import { WeeklyMonthCardUtility } from "../utility/WeeklyMonthCardUtility";

const { ccclass, property } = _decorator;

@ccclass("WeeklyMonthCardNewDialog")
export class WeeklyMonthCardNewDialog extends BaseDialog {
    @property(Node)
    public cardNode: Node = null;

    @property(Node)
    public ruleNode: Node = null;

    @property(Label)
    public ruleLabel: Label = null;

    private openData = new WeeklyMonthCardOpenData();
    private lastBuyClick = 0;
    private lastRuleClick = 0;
    private purchaseInFlight = false;
    private readonly roomScale = v3(0.85, 0.85, 0.85);

    protected OnInit(uiData: WeeklyMonthCardOpenData = null): void {
        ensureWeeklyMonthCardRegistered();
        if (uiData) {
            this.openData = uiData;
        }
        this.resolveNodes();
        this.applyRoomLayout();
        if (this.ruleNode) {
            this.ruleNode.active = false;
        }
        this.playTitleAnim();
        this.wireChromeButtons();
        GameApp.Interface.GetModel(WeeklyMonthCardModel).page.RegisterWithInitValue((p) => this.onPageBound(p), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        this.registerEvents();
        GameApp.Interface.GetSystem(UISystem).showBlockingLoading();
        GameApp.Interface.SendCommand(
            new FetchWeeklyMonthCardPageCommand(this.openData.openAct, this.openData.vid),
        );
    }

    protected OnClose(): void {}

    private resolveNodes(): void {
        const root = this.node.getChildByName("rootNode");
        if (!this.cardNode && root) {
            this.cardNode = root.getChildByName("cardNode");
        }
        if (!this.ruleNode && root) {
            this.ruleNode = root.getChildByName("rule");
        }
        if (!this.ruleLabel && this.ruleNode) {
            const scroll = this.ruleNode.getChildByName("ScrollView") ?? this.ruleNode;
            this.ruleLabel =
                scroll.getComponentInChildren(Label) ?? this.ruleNode.getComponentInChildren(Label);
        }
    }

    private applyRoomLayout(): void {
        const root = this.node.getChildByName("rootNode");
        if (this.openData.inRoom && root) {
            root.setScale(this.roomScale);
        }
    }

    private playTitleAnim(): void {
        const animNode = this.cardNode?.getChildByName("anim");
        const sk = animNode?.getComponent(sp.Skeleton);
        if (sk) {
            sk.clearTracks();
            sk.setToSetupPose();
            sk.setAnimation(0, "title", false);
        }
    }

    private wireChromeButtons(): void {
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("close_btn", () => this.CloseSelf());
        this.wireByName("btn_rule", () => this.onRuleClick());
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

    private registerEvents(): void {
        GameApp.Interface.RegisterEvent(WeeklyMonthCardPageReadyEvent, (e) => this.onPageReady(e), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(WeeklyMonthCardPageFetchFailedEvent, (e) => this.onFetchFailed(e), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(WeeklyMonthCardTipsReadyEvent, () => this.onTipsReady(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(WeeklyMonthCardPurchaseSuccessEvent, (e) => this.onPurchaseOk(e), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(WeeklyMonthCardPurchaseFailedEvent, (e) => this.onPurchaseFail(e), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private onPageBound(page: WeeklyMonthCardPageDto | null): void {
        if (!page) {
            return;
        }
        const util = GameApp.Interface.GetUtility(WeeklyMonthCardUtility);
        util.applyPage({ cardNode: this.cardNode, onBuy: (c) => this.onBuyClick(c) }, page);
    }

    private onPageReady(_e: WeeklyMonthCardPageReadyEvent): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        const page = GameApp.Interface.GetModel(WeeklyMonthCardModel).page.value;
        if (!page) {
            this.CloseSelf();
            return;
        }
        this.onPageBound(page);
        this.showPopRewards(page.pop_reward);
    }

    private onFetchFailed(e: WeeklyMonthCardPageFetchFailedEvent): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        GameApp.Interface.GetSystem(UISystem).showToast(e.message || "Failed to load");
        this.CloseSelf();
    }

    private onRuleClick(): void {
        const now = Date.now();
        if (now - this.lastRuleClick < 1000) {
            return;
        }
        this.lastRuleClick = now;
        const cached = GameApp.Interface.GetModel(WeeklyMonthCardModel).tips.value;
        if (cached) {
            this.showRule(cached);
            return;
        }
        GameApp.Interface.SendCommand(new FetchWeeklyMonthCardTipsCommand());
    }

    private onTipsReady(): void {
        const tips = GameApp.Interface.GetModel(WeeklyMonthCardModel).tips.value ?? "";
        this.showRule(tips);
    }

    private showRule(tips: string): void {
        if (!this.ruleNode) {
            return;
        }
        this.ruleNode.active = true;
        if (this.ruleLabel) {
            this.ruleLabel.string = tips;
        }
    }

    private onBuyClick(card: WeeklyMonthCardItemDto): void {
        const now = Date.now();
        if (now - this.lastBuyClick < 500 || this.purchaseInFlight) {
            return;
        }
        this.lastBuyClick = now;
        this.purchaseInFlight = true;
        GameApp.Interface.SendCommand(new StartWeeklyMonthCardPurchaseCommand(card));
    }

    private onPurchaseOk(e: WeeklyMonthCardPurchaseSuccessEvent): void {
        this.purchaseInFlight = false;
        const ui = GameApp.Interface.GetSystem(UISystem);
        if (e.msg) {
            ui.showToast(e.msg);
        }
        this.showPopRewards(e.reward);
    }

    private onPurchaseFail(e: WeeklyMonthCardPurchaseFailedEvent): void {
        this.purchaseInFlight = false;
        GameApp.Interface.GetSystem(UISystem).showToast(e.message || "Purchase failed");
    }

    private showPopRewards(rewards: WeeklyMonthCardRewardDto[] | undefined): void {
        if (!rewards?.length) {
            return;
        }
        const parts = rewards.map((r) => `+${r.amt ?? r.num ?? 0}`).join(" ");
        GameApp.Interface.GetSystem(UISystem).showToast(parts);
    }
}

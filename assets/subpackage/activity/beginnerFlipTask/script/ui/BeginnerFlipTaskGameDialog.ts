import {
    _decorator,
    Button,
    Label,
    Node,
    Sprite,
    SpriteFrame,
    tween,
    UIOpacity,
    Vec3,
} from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { I18NSystem } from "../../../../../script/game/system/I18NSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { Utility, UtilityTweenHandle } from "../../../../../script/game/utility/Utility";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { ensureBeginnerFlipTaskRegistered } from "../BeginnerFlipTaskModule";
import { ClaimBeginnerFlipRewardCommand } from "../command/ClaimBeginnerFlipRewardCommand";
import {
    BeginnerFlipGameOpenData,
    BeginnerFlipPageDto,
    BeginnerFlipRewardDto,
} from "../config/BeginnerFlipTaskConfig";
import {
    BeginnerFlipClaimFailedEvent,
    BeginnerFlipClaimSuccessEvent,
} from "../event/BeginnerFlipTaskEvents";

const { ccclass, property } = _decorator;

@ccclass("BeginnerFlipTaskGameDialog")
export class BeginnerFlipTaskGameDialog extends BaseDialog {
    @property(Node)
    public root: Node = null;

    @property(Node)
    public itemRoot: Node = null;

    @property([SpriteFrame])
    public bgImgs: SpriteFrame[] = [];

    @property([SpriteFrame])
    public taskIcons_cb: SpriteFrame[] = [];

    private sourceData: BeginnerFlipPageDto | null = null;
    private vid = "";
    private tidKey = "";
    private lastClick = 0;
    private timeCount = 6;
    private canGetReward = true;
    private hasPlayAnim = false;
    private hasGetReward = false;
    private selectedIndex = 0;
    private tickHandle: UtilityTweenHandle | null = null;

    private get ui(): UISystem {
        return GameApp.Interface.GetSystem(UISystem);
    }

    protected OnInit(uiData: BeginnerFlipGameOpenData = null): void {
        ensureBeginnerFlipTaskRegistered();
        if (uiData) {
            this.sourceData = uiData.source;
            this.vid = uiData.vid;
            this.tidKey = uiData.tidKey;
        }
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        this.ensureEditorRefs();
        this.initView();
        this.wireItems();
        this.registerEvents();
        Utility.tween.delay(this.node, 0.05, () => {
            if (this.sourceData) {
                this.refreshView();
            }
        });
    }

    protected OnClose(): void {
        this.stopTick();
        this.ui.hideBlockingLoading();
    }

    private ensureEditorRefs(): void {
        if (!this.root) {
            this.root = this.node.getChildByName("root");
        }
        if (!this.itemRoot && this.root) {
            this.itemRoot = this.root.getChildByName("itemRoot");
        }
    }

    private wireItems(): void {
        for (let i = 0; i < 5; i++) {
            const moban = this.itemRoot?.getChildByName(`moban${i}`);
            moban?.on(Button.EventType.CLICK, () => this.onPickCard(i), this);
        }
    }

    private registerEvents(): void {
        GameApp.Interface.RegisterEvent(BeginnerFlipClaimSuccessEvent, this.onClaimOk, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(BeginnerFlipClaimFailedEvent, this.onClaimFail, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private initView(): void {
        for (let i = 0; i < 5; i++) {
            const moban = this.itemRoot?.getChildByName(`moban${i}`);
            if (!Utility.node.isValid(moban)) {
                continue;
            }
            const opacity = moban.getComponent(UIOpacity);
            if (opacity) {
                opacity.opacity = 0;
            }
            const bg = moban.getChildByName("bg")?.getComponent(Sprite);
            if (bg && this.bgImgs.length > 0) {
                bg.spriteFrame = this.bgImgs[0];
            }
        }
    }

    private refreshView(): void {
        this.initView();
        this.timeCount = 6;
        this.stopTick();
        this.updateTimeLabel();
        this.tickHandle = Utility.tween.scheduleRepeating(this.node, 1, () => this.updateTime());
        if (!this.hasPlayAnim) {
            this.hasPlayAnim = true;
            for (let e = 0; e < 5; e++) {
                const moban = this.itemRoot?.getChildByName(`moban${e}`);
                if (!moban) {
                    continue;
                }
                const opacity = moban.getComponent(UIOpacity) ?? moban.addComponent(UIOpacity);
                moban.setScale(new Vec3(0.5, 0.5, 0.5));
                opacity.opacity = 0;
                tween(moban)
                    .delay(0.08 * e)
                    .to(0.1, { scale: new Vec3(1.1, 1.1, 1.1) }, {
                        onUpdate: (_t, ratio) => {
                            opacity.opacity = 255 * ratio;
                        },
                    })
                    .to(0.1, { scale: new Vec3(1, 1, 1) })
                    .call(() => {
                        opacity.opacity = 255;
                    })
                    .start();
            }
        }
    }

    private updateTime(): void {
        if (this.timeCount > 1) {
            this.timeCount -= 1;
            this.updateTimeLabel();
            return;
        }
        this.stopTick();
        if (!this.canGetReward) {
            return;
        }
        this.canGetReward = false;
        const pick = Math.floor(Math.random() * 5);
        this.dealGetReward(pick);
    }

    private updateTimeLabel(): void {
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        const tip = this.root?.getChildByName("tip")?.getComponent(Label);
        if (tip) {
            tip.string = Utility.format.template(
                i18n.getValueByKey("flop_cash.choose_count"),
                this.timeCount,
            );
        }
    }

    private onPickCard(index: number): void {
        if (Date.now() - this.lastClick < 500) {
            return;
        }
        this.lastClick = Date.now();
        if (!this.canGetReward) {
            return;
        }
        this.canGetReward = false;
        this.stopTick();
        this.dealGetReward(index);
    }

    private dealGetReward(index: number): void {
        if (!this.sourceData?.task_id) {
            return;
        }
        this.selectedIndex = index;
        this.ui.showBlockingLoading();
        GameApp.Interface.SendCommand(
            new ClaimBeginnerFlipRewardCommand(
                this.sourceData.task_id,
                index + 1,
                this.vid,
                this.tidKey,
            ),
        );
    }

    private onClaimOk(e: BeginnerFlipClaimSuccessEvent): void {
        this.ui.hideBlockingLoading();
        this.hasGetReward = true;
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        const next = e.result.next_play_num ?? 0;
        let tip = Utility.format.template(i18n.getValueByKey("flop_cash.reward_tip"), next);
        if (next === 0) {
            tip = i18n.getValueByKey("flop_cash.cmp_tip");
        }
        const tipLbl = this.root?.getChildByName("tip")?.getComponent(Label);
        if (tipLbl) {
            tipLbl.string = tip;
        }
        const reward = e.result.reward_data;
        if (reward) {
            this.flipCard(this.selectedIndex, reward);
        }
        const cash = reward?.cash ?? 0;
        const bonus = reward?.bonus ?? 0;
        if (cash > 0 || bonus > 0) {
            this.ui.showToast(
                Utility.format.template(
                    i18n.getValueByKey("flip_act.total_get"),
                    Number((cash + bonus).toFixed(2)),
                ),
            );
        }
        Utility.tween.delay(this.node, 2, () => this.CloseSelf());
    }

    private onClaimFail(e: BeginnerFlipClaimFailedEvent): void {
        this.ui.hideBlockingLoading();
        this.canGetReward = true;
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        this.ui.showToast(i18n.getValueByKey("utlis.text6"));
        LogKit.W("[BeginnerFlipTaskGameDialog] claim failed {0}", e.message);
    }

    private flipCard(index: number, data: BeginnerFlipRewardDto): void {
        const moban = this.itemRoot?.getChildByName(`moban${index}`);
        if (!Utility.node.isValid(moban)) {
            return;
        }
        tween(moban)
            .to(0.2, { scale: new Vec3(0, 1, 1) })
            .call(() => this.initItemView(moban, { ...data, is_get: 1 }))
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    private initItemView(item: Node, data: BeginnerFlipRewardDto): void {
        if (!Utility.node.isValid(item) || !data) {
            return;
        }
        item.active = true;
        const bg = item.getChildByName("bg")?.getComponent(Sprite);
        if (bg && this.bgImgs.length > 1) {
            bg.spriteFrame = this.bgImgs[1];
        }
        const rewardNode = item.getChildByName("reward_node");
        if (rewardNode) {
            rewardNode.active = true;
        }
        let total = 0;
        if (data.cash && data.cash > 0) {
            const cash = rewardNode?.getChildByName("cash_diban");
            if (cash) {
                cash.active = true;
                cash.getChildByName("wz")?.getComponent(Label)?.string = String(data.cash);
            }
            total += data.cash;
        }
        if (data.bonus && data.bonus > 0) {
            const bonus = rewardNode?.getChildByName("bonus_diban");
            if (bonus) {
                bonus.active = true;
                bonus.getChildByName("wz")?.getComponent(Label)?.string = String(data.bonus);
            }
            total += data.bonus;
        }
        const totalLbl = item.getChildByName("total")?.getComponent(Label);
        if (totalLbl) {
            totalLbl.string = Utility.format.template(
                GameApp.Interface.GetSystem(I18NSystem).getValueByKey("flip_act.total_get"),
                Number(total.toFixed(2)),
            );
            totalLbl.node.active = true;
        }
    }

    private stopTick(): void {
        this.tickHandle?.stop();
        this.tickHandle = null;
    }
}

import {
    _decorator,
    Button,
    Label,
    Node,
    ProgressBar,
    Sprite,
    SpriteFrame,
    tween,
    Vec3,
} from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { SubGameId } from "../../../../../script/game/config/BundleManifest";
import { EnterSubGameCommand } from "../../../../../script/game/command/EnterSubGameCommand";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { I18NSystem } from "../../../../../script/game/system/I18NSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { Utility, UtilityTweenHandle } from "../../../../../script/game/utility/Utility";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { ensureBeginnerFlipTaskRegistered, openBeginnerFlipRecordDialog } from "../BeginnerFlipTaskModule";
import { FetchBeginnerFlipPageCommand } from "../command/FetchBeginnerFlipPageCommand";
import {
    BeginnerFlipPageDto,
    BeginnerFlipRewardDto,
    BeginnerFlipTaskOpenData,
} from "../config/BeginnerFlipTaskConfig";
import { BeginnerFlipPageFetchFailedEvent } from "../event/BeginnerFlipTaskEvents";
import { BeginnerFlipTaskModel } from "../model/BeginnerFlipTaskModel";

const { ccclass, property } = _decorator;

const STATUS_PLAYING = 1;

@ccclass("BeginnerFlipTaskDialog")
export class BeginnerFlipTaskDialog extends BaseDialog {
    @property(Node)
    public root: Node = null;

    @property(Node)
    public itemRoot: Node = null;

    @property(Node)
    public expireTime: Node = null;

    @property(Node)
    public playNowBtn: Node = null;

    @property(Node)
    public target_room_info: Node = null;

    @property([SpriteFrame])
    public bgImgs: SpriteFrame[] = [];

    @property([SpriteFrame])
    public taskIcons_cb: SpriteFrame[] = [];

    private openData = new BeginnerFlipTaskOpenData();
    private lastClick = 0;
    private hasClose = false;
    private tickHandle: UtilityTweenHandle | null = null;
    private jumpShowStr = "Rummy-Points/Classic-6P";

    private get ui(): UISystem {
        return GameApp.Interface.GetSystem(UISystem);
    }

    protected OnInit(uiData: BeginnerFlipTaskOpenData = null): void {
        ensureBeginnerFlipTaskRegistered();
        if (uiData) {
            this.openData = uiData;
        }
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        this.ensureEditorRefs();
        this.initView();
        this.wireButtons();
        this.registerEvents();
        GameApp.Interface.SendCommand(new FetchBeginnerFlipPageCommand());
    }

    protected OnClose(): void {
        this.stopTick();
    }

    private ensureEditorRefs(): void {
        if (!this.root) {
            this.root = this.node.getChildByName("root");
        }
        if (!this.itemRoot && this.root) {
            this.itemRoot = this.root.getChildByName("itemRoot");
        }
        if (!this.expireTime && this.root) {
            this.expireTime = this.root.getChildByName("expireTime");
        }
        if (!this.playNowBtn && this.root) {
            this.playNowBtn = this.root.getChildByName("playNowBtn");
        }
        if (!this.target_room_info && this.root) {
            this.target_room_info = this.root.getChildByName("target_room_info");
        }
    }

    private wireButtons(): void {
        const closeBtn = this.root?.getChildByName("close_btn");
        closeBtn?.on(Button.EventType.CLICK, () => this.onBtn("close"), this);
        const recordBtn = this.root?.getChildByName("record_btn");
        recordBtn?.on(Button.EventType.CLICK, () => this.onBtn("record"), this);
        this.playNowBtn?.on(Button.EventType.CLICK, () => this.onBtn("play"), this);
    }

    private registerEvents(): void {
        const model = GameApp.Interface.GetModel(BeginnerFlipTaskModel);
        model.page
            .RegisterWithInitValue((page) => {
                if (page) {
                    this.applyPage(page);
                }
            }, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(BeginnerFlipPageFetchFailedEvent, this.onFetchFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private onFetchFailed(e: BeginnerFlipPageFetchFailedEvent): void {
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        this.ui.showToast(i18n.getValueByKey("utlis.text6"));
        LogKit.W("[BeginnerFlipTaskDialog] fetch failed {0}", e.message);
    }

    private initView(): void {
        if (!this.itemRoot || this.bgImgs.length === 0) {
            return;
        }
        for (let i = 0; i < 5; i++) {
            const moban = this.itemRoot.getChildByName(`moban${i}`);
            if (!Utility.node.isValid(moban)) {
                continue;
            }
            const bg = moban.getChildByName("bg")?.getComponent(Sprite);
            if (bg) {
                bg.spriteFrame = this.bgImgs[0];
            }
            moban.getChildByName("icon")?.active && (moban.getChildByName("icon").active = false);
            moban.getChildByName("reward_node")?.active && (moban.getChildByName("reward_node").active = false);
            moban.getChildByName("total")?.active && (moban.getChildByName("total").active = false);
            moban.getChildByName("effect")?.active && (moban.getChildByName("effect").active = false);
            moban.getChildByName("mask")?.active && (moban.getChildByName("mask").active = false);
        }
        this.root?.getChildByName("cmp_tip")?.active && (this.root.getChildByName("cmp_tip").active = false);
        this.root?.getChildByName("ProgressBar")?.active && (this.root.getChildByName("ProgressBar").active = true);
        this.root?.getChildByName("percent")?.active && (this.root.getChildByName("percent").active = true);
    }

    private applyPage(page: BeginnerFlipPageDto): void {
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        if (page.time_left != null && this.expireTime) {
            this.stopTick();
            this.updateTimeLabel(page.time_left, i18n);
            this.tickHandle = Utility.tween.scheduleRepeating(this.expireTime, 1, () => {
                const model = GameApp.Interface.GetModel(BeginnerFlipTaskModel);
                const p = model.page.value;
                if (!p || p.time_left == null) {
                    return;
                }
                p.time_left = Math.max(0, p.time_left - 1);
                if (p.time_left <= 0) {
                    this.stopTick();
                    this.CloseSelf();
                    return;
                }
                this.updateTimeLabel(p.time_left, i18n);
            });
        }

        let status = page.today_task_status ?? STATUS_PLAYING;
        const playTxt = this.playNowBtn?.getChildByName("txt")?.getComponent(Label);
        if (status === STATUS_PLAYING) {
            if (playTxt) {
                playTxt.string = i18n.getValueByKey("choose_game.play_now");
            }
            this.initView();
            const target = page.target_play_num ?? 1;
            const current = page.current_play_num ?? 0;
            if (target > 0) {
                const bar = this.root?.getChildByName("ProgressBar")?.getComponent(ProgressBar);
                if (bar) {
                    bar.progress = current / target;
                    bar.node.active = true;
                }
                const percent = this.root?.getChildByName("percent")?.getComponent(Label);
                if (percent) {
                    percent.string = Utility.format.template(
                        i18n.getValueByKey("flop_cash.percent"),
                        current,
                        target,
                    );
                    percent.node.active = true;
                }
            }
        } else {
            this.root?.getChildByName("ProgressBar")?.active && (this.root.getChildByName("ProgressBar").active = false);
            this.root?.getChildByName("percent")?.active && (this.root.getChildByName("percent").active = false);
            const cmpTip = this.root?.getChildByName("cmp_tip");
            if (cmpTip) {
                cmpTip.active = true;
                const key = page.is_last_day === 1 ? "flop_cash.cmp_tip2" : "flop_cash.cmp_tip";
                cmpTip.getComponent(Label)?.string = i18n.getValueByKey(key);
            }
            if (playTxt) {
                playTxt.string = i18n.getValueByKey("email.okey");
            }
            const rewards = page.reward ?? [];
            const count = Math.min(rewards.length, 5);
            for (let i = 0; i < count; i++) {
                const moban = this.itemRoot?.getChildByName(`moban${i}`);
                if (moban) {
                    this.initItemView(moban, rewards[i]);
                }
            }
        }

        const tip = this.root?.getChildByName("tip")?.getComponent(Label);
        if (tip && page.max_reward != null) {
            tip.string = Utility.format.template(
                i18n.getValueByKey("flop_cash.up_tip"),
                page.max_reward,
            );
        }

        this.refreshPlayRoom(page, i18n);
    }

    private refreshPlayRoom(page: BeginnerFlipPageDto, i18n: I18NSystem): void {
        const jump = page.jump;
        if (jump?.htype === 1) {
            this.jumpShowStr = "Rummy-Points/Classic-6P";
        } else {
            this.jumpShowStr = "Rummy";
        }
        const info = this.target_room_info?.getComponent(Label);
        if (info) {
            info.string = this.jumpShowStr;
        }
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
        if (data.is_get != null) {
            const mask = item.getChildByName("mask");
            const effect = item.getChildByName("effect");
            if (data.is_get === 0) {
                if (mask) {
                    mask.active = true;
                }
                if (effect) {
                    effect.active = false;
                }
            } else {
                if (mask) {
                    mask.active = false;
                }
                if (effect) {
                    effect.active = true;
                }
            }
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

    private updateTimeLabel(left: number, i18n: I18NSystem): void {
        const lbl = this.expireTime?.getComponent(Label);
        if (!lbl) {
            return;
        }
        lbl.string = Utility.format.template(
            i18n.getValueByKey("lottery.time_left"),
            Utility.time.durationShort(left),
        );
    }

    private stopTick(): void {
        this.tickHandle?.stop();
        this.tickHandle = null;
    }

    private onBtn(tag: string): void {
        if (Date.now() - this.lastClick < 500) {
            return;
        }
        this.lastClick = Date.now();
        if (tag === "close") {
            if (this.hasClose) {
                return;
            }
            this.hasClose = true;
            this.CloseSelf();
            return;
        }
        if (tag === "record") {
            void openBeginnerFlipRecordDialog();
            return;
        }
        if (tag === "play") {
            this.dealPlayNow();
        }
    }

    private dealPlayNow(): void {
        const page = GameApp.Interface.GetModel(BeginnerFlipTaskModel).page.value;
        if (page?.today_task_status !== STATUS_PLAYING) {
            this.CloseSelf();
            return;
        }
        this.CloseSelf();
        GameApp.Interface.SendCommand(new EnterSubGameCommand(SubGameId.Rummy));
    }

    protected startShowAnim(target: Node): void {
        if (!Utility.node.isValid(target)) {
            return;
        }
        target.setScale(new Vec3(0.85, 0.85, 1));
        tween(target).to(0.2, { scale: new Vec3(1, 1, 1) }).start();
    }
}

import {
    _decorator,
    Button,
    Color,
    Label,
    Node,
    Sprite,
    SpriteFrame,
    tween,
    Vec3,
} from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { I18NSystem } from "../../../../../script/game/system/I18NSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { Utility } from "../../../../../script/game/utility/Utility";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { ensureDailyCheckinRegistered } from "../DailyCheckinModule";
import { ClaimDailyCheckinRewardCommand } from "../command/ClaimDailyCheckinRewardCommand";
import { FetchDailyCheckinPageCommand } from "../command/FetchDailyCheckinPageCommand";
import {
    DailyCheckinDayRewardDto,
    DailyCheckinOpenData,
    DailyCheckinPageDto,
} from "../config/DailyCheckinConfig";
import {
    DailyCheckinClaimFailedEvent,
    DailyCheckinClaimSuccessEvent,
    DailyCheckinFetchFailedEvent,
} from "../event/DailyCheckinEvents";
import { DailyCheckinModel } from "../model/DailyCheckinModel";

const { ccclass, property } = _decorator;

const STATUS_CLAIMABLE = 0;

@ccclass("DailyCheckinDialog")
export class DailyCheckinDialog extends BaseDialog {
    @property(Node)
    public root: Node = null;

    @property([SpriteFrame])
    public reward_imgs: SpriteFrame[] = [];

    @property([SpriteFrame])
    public item_imgs: SpriteFrame[] = [];

    @property([SpriteFrame])
    public collect_img: SpriteFrame[] = [];

    private openData = new DailyCheckinOpenData();
    private lastClick = 0;
    private hasClose = false;
    private curDay = 1;
    private canGetReward = false;

    private get ui(): UISystem {
        return GameApp.Interface.GetSystem(UISystem);
    }

    protected OnInit(uiData: DailyCheckinOpenData = null): void {
        ensureDailyCheckinRegistered();
        if (uiData) {
            this.openData = uiData;
        }
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        this.ensureEditorRefs();
        this.wireButtons();
        this.registerEvents();
        GameApp.Interface.SendCommand(new FetchDailyCheckinPageCommand());
    }

    protected OnClose(): void {
        this.ui.hideBlockingLoading();
    }

    private ensureEditorRefs(): void {
        if (!this.root) {
            this.root = this.node.getChildByName("root");
        }
    }

    private wireButtons(): void {
        const collect = this.root?.getChildByName("collect_btn");
        collect?.on(Button.EventType.CLICK, () => this.onCollectClick(), this);
        for (let i = 0; i < 7; i++) {
            const item = this.root?.getChildByName(`item${i}`);
            item?.on(Button.EventType.CLICK, () => this.onCollectClick(), this);
        }
        const closeBtn = this.root?.getChildByName("close_btn");
        closeBtn?.on(Button.EventType.CLICK, () => this.onCloseClick(), this);
    }

    private registerEvents(): void {
        const model = GameApp.Interface.GetModel(DailyCheckinModel);
        model.page
            .RegisterWithInitValue((page) => {
                if (page) {
                    this.applyPage(page);
                }
            }, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(DailyCheckinFetchFailedEvent, this.onFetchFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(DailyCheckinClaimSuccessEvent, this.onClaimSuccess, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(DailyCheckinClaimFailedEvent, this.onClaimFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private onFetchFailed(e: DailyCheckinFetchFailedEvent): void {
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        this.ui.showToast(i18n.getValueByKey("utlis.text6"));
        LogKit.W("[DailyCheckinDialog] fetch failed {0}", e.message);
    }

    private onClaimSuccess(e: DailyCheckinClaimSuccessEvent): void {
        this.ui.hideBlockingLoading();
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        const tip = e.result.tip?.length ? e.result.tip : i18n.getValueByKey("daily_tasks.collect");
        this.ui.showToast(tip);
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
    }

    private onClaimFailed(e: DailyCheckinClaimFailedEvent): void {
        this.ui.hideBlockingLoading();
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        this.ui.showToast(i18n.getValueByKey("utlis.text6"));
        LogKit.W("[DailyCheckinDialog] claim failed {0}", e.message);
    }

    private applyPage(page: DailyCheckinPageDto): void {
        if (page.day != null) {
            this.curDay = Number(page.day);
        }
        this.canGetReward = page.status === STATUS_CLAIMABLE;
        const rewards = page.every_reward ?? [];
        if (rewards.length === 7) {
            for (let i = 0; i < 7; i++) {
                const item = this.root?.getChildByName(`item${i}`);
                if (item) {
                    this.updateItemNode(item, rewards[i], i + 1);
                }
            }
        }
        this.updateCollectBtnState();
    }

    private updateCollectBtnState(): void {
        const btn = this.root?.getChildByName("collect_btn");
        if (!btn || this.collect_img.length < 2) {
            return;
        }
        const sprite = btn.getComponent(Sprite);
        const label = btn.getChildByName("wz")?.getComponent(Label);
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        if (this.canGetReward) {
            if (sprite) {
                sprite.spriteFrame = this.collect_img[1];
            }
            const button = btn.getComponent(Button);
            if (button) {
                button.interactable = true;
            }
            if (label) {
                label.color = new Color(255, 255, 255);
                label.string = i18n.getValueByKey("daily_tasks.collect");
            }
        } else {
            if (sprite) {
                sprite.spriteFrame = this.collect_img[0];
            }
            const button = btn.getComponent(Button);
            if (button) {
                button.interactable = false;
            }
            if (label) {
                label.color = new Color(102, 102, 102);
                label.string = i18n.getValueByKey("daily_tasks.tomorrow") ?? "TOMORROW";
            }
        }
    }

    private updateItemNode(item: Node, dayReward: DailyCheckinDayRewardDto, dayIndex: number): void {
        if (!Utility.node.isValid(item)) {
            return;
        }
        const ico = item.getChildByName("ico")?.getComponent(Sprite);
        const gou = item.getChildByName("gou");
        const button = item.getComponent(Button);
        if (dayIndex !== this.curDay) {
            if (ico && this.item_imgs.length > 0) {
                ico.spriteFrame = this.item_imgs[0];
            }
            if (gou) {
                gou.active = dayIndex < this.curDay;
            }
            if (button) {
                button.interactable = false;
            }
        } else {
            if (ico && this.item_imgs.length > 1) {
                ico.spriteFrame = this.item_imgs[1];
            }
            if (gou) {
                gou.active = !this.canGetReward;
            }
            if (button) {
                button.interactable = this.canGetReward;
            }
        }
        const rewardRoot = item.getChildByName("reward_root");
        if (!rewardRoot) {
            return;
        }
        rewardRoot.active = true;
        for (let r = 0; r < 3; r++) {
            const slot = rewardRoot.getChildByName(`reward${r}`);
            if (slot) {
                slot.active = false;
            }
        }
        const list = dayReward?.rewards ?? [];
        const count = Math.min(list.length, 2);
        for (let r = 0; r < count; r++) {
            const entry = list[r];
            let imgType = Number(entry.type ?? 0);
            if (imgType === 7) {
                imgType = 2;
            }
            const slot = rewardRoot.getChildByName(`reward${r}`);
            if (!slot) {
                continue;
            }
            slot.active = true;
            const slotIco = slot.getChildByName("ico")?.getComponent(Sprite);
            if (slotIco && this.reward_imgs[imgType]) {
                slotIco.spriteFrame = this.reward_imgs[imgType];
            }
            const wz = slot.getChildByName("wz")?.getComponent(Label);
            if (wz) {
                wz.string = `X${String(entry.num ?? 0)}`;
                wz.color =
                    dayIndex !== this.curDay
                        ? new Color(51, 51, 51)
                        : new Color(154, 70, 28);
            }
        }
    }

    private onCollectClick(): void {
        if (Date.now() - this.lastClick < 500) {
            return;
        }
        this.lastClick = Date.now();
        if (!this.canGetReward) {
            return;
        }
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        this.ui.showBlockingLoading();
        GameApp.Interface.SendCommand(new ClaimDailyCheckinRewardCommand(this.curDay));
    }

    private onCloseClick(): void {
        if (this.hasClose) {
            return;
        }
        this.hasClose = true;
        this.CloseSelf();
    }

    protected startShowAnim(target: Node): void {
        if (!Utility.node.isValid(target)) {
            return;
        }
        target.setScale(new Vec3(0.85, 0.85, 1));
        tween(target).to(0.2, { scale: new Vec3(1, 1, 1) }).start();
    }
}

import {
    _decorator,
    Button,
    Label,
    Node,
    SpriteAtlas,
    SpriteFrame,
    v3,
} from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { EnterSubGameCommand } from "../../../../../script/game/command/EnterSubGameCommand";
import { SubGameId } from "../../../../../script/game/config/BundleManifest";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { I18NSystem } from "../../../../../script/game/system/I18NSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { Utility } from "../../../../../script/game/utility/Utility";
import { ensureNewPlayerTaskRegistered } from "../NewPlayerTaskModule";
import { ClaimNewPlayerTaskRewardCommand } from "../command/ClaimNewPlayerTaskRewardCommand";
import { FetchNewPlayerTaskPageCommand } from "../command/FetchNewPlayerTaskPageCommand";
import { NewPlayerTaskOpenData, NewPlayerTaskPageDto } from "../config/NewPlayerTaskConfig";
import {
    NewPlayerTaskClaimFailedEvent,
    NewPlayerTaskClaimSuccessEvent,
    NewPlayerTaskPageFetchFailedEvent,
} from "../event/NewPlayerTaskEvents";
import { NewPlayerTaskModel } from "../model/NewPlayerTaskModel";
import { NewPlayerTaskUiRefs, NewPlayerTaskUtility } from "../utility/NewPlayerTaskUtility";

const { ccclass, property } = _decorator;

@ccclass("NewPlayerTaskDialog")
export class NewPlayerTaskDialog extends BaseDialog {
    @property([SpriteFrame])
    public dailyItemSprites: SpriteFrame[] = [];

    @property([SpriteFrame])
    public taskBtnSprites: SpriteFrame[] = [];

    @property([SpriteFrame])
    public boxSprites: SpriteFrame[] = [];

    @property(Node)
    public rootNode: Node = null;

    @property(Label)
    public timeLabel: Label = null;

    @property([Node])
    public taskItems: Node[] = [];

    @property([Node])
    public boxItems: Node[] = [];

    @property([Node])
    public progressItems: Node[] = [];

    @property(Node)
    public rewardModel: Node = null;

    @property(Node)
    public tipsRewardModel: Node = null;

    @property(Node)
    public ruleNode: Node = null;

    @property(Label)
    public ruleLabel: Label = null;

    @property(Node)
    public tipsBubbleNode: Node = null;

    @property(SpriteAtlas)
    public rewardPlist: SpriteAtlas = null;

    private openData = new NewPlayerTaskOpenData();
    private leftTime = -1;
    private countdownHandle: { stop: () => void } | null = null;
    private claimInFlight = false;
    private curTipIdx = -1;
    private readonly roomScale = v3(0.74, 0.74, 0.74);

    private get ui(): UISystem {
        return GameApp.Interface.GetSystem(UISystem);
    }

    private get nptUtil(): NewPlayerTaskUtility {
        return GameApp.Interface.GetUtility(NewPlayerTaskUtility);
    }

    protected OnInit(uiData: NewPlayerTaskOpenData = null): void {
        ensureNewPlayerTaskRegistered();
        if (uiData) {
            this.openData = uiData;
        }
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        this.applyRoomLayout();
        this.ensureEditorRefs();
        if (this.ruleNode) {
            this.ruleNode.active = false;
        }
        if (this.tipsBubbleNode) {
            this.tipsBubbleNode.active = false;
        }
        if (this.rewardModel) {
            this.rewardModel.active = false;
        }
        this.wireButtons();
        this.registerEvents();
        GameApp.Interface.SendCommand(new FetchNewPlayerTaskPageCommand(this.openData.vid));
    }

    protected OnClose(): void {
        this.stopCountdown();
        this.ui.hideBlockingLoading();
    }

    private applyRoomLayout(): void {
        if (!this.rootNode) {
            return;
        }
        const closeBtn = this.rootNode.getChildByName("close_btn");
        if (this.openData.inRoom) {
            this.rootNode.setScale(this.roomScale);
            this.rootNode.setPosition(v3(0, -10, 0));
        } else if (closeBtn) {
            closeBtn.setPosition(v3(309.84, 452.428, 0));
        }
    }

    private ensureEditorRefs(): void {
        if (!this.rootNode) {
            this.rootNode = this.node.getChildByName("root") ?? this.node;
        }
    }

    private uiRefs(): NewPlayerTaskUiRefs {
        return {
            rootNode: this.rootNode,
            timeLabel: this.timeLabel,
            taskItems: this.taskItems,
            boxItems: this.boxItems,
            progressItems: this.progressItems,
            rewardModel: this.rewardModel,
            tipsRewardModel: this.tipsRewardModel,
            tipsBubbleNode: this.tipsBubbleNode,
            dailyItemSprites: this.dailyItemSprites,
            taskBtnSprites: this.taskBtnSprites,
            boxSprites: this.boxSprites,
            rewardPlist: this.rewardPlist,
            inRoom: this.openData.inRoom,
        };
    }

    private wireButtons(): void {
        const closeBtn = this.rootNode?.getChildByName("close_btn");
        closeBtn?.on(Button.EventType.CLICK, () => this.onCloseClick(), this);
        const helpBtn = this.rootNode?.getChildByName("help_btn");
        helpBtn?.on(Button.EventType.CLICK, () => this.onHelpClick(), this);
        const helpClose = this.ruleNode?.getChildByName("close_btn");
        helpClose?.on(Button.EventType.CLICK, () => this.onRuleCloseClick(), this);

        for (let i = 0; i < this.taskItems.length; i++) {
            const btn = this.taskItems[i]?.getChildByName("btn");
            btn?.on(Button.EventType.CLICK, () => this.onTaskBtnClick(i), this);
        }
        for (let i = 0; i < this.boxItems.length; i++) {
            this.boxItems[i]?.on(Button.EventType.CLICK, () => this.onBoxClick(i), this);
        }
    }

    private registerEvents(): void {
        const model = GameApp.Interface.GetModel(NewPlayerTaskModel);
        model.page
            .RegisterWithInitValue((page) => {
                if (page) {
                    this.applyPage(page);
                }
            }, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(NewPlayerTaskPageFetchFailedEvent, this.onFetchFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(NewPlayerTaskClaimSuccessEvent, this.onClaimSuccess, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(NewPlayerTaskClaimFailedEvent, this.onClaimFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private onFetchFailed(e: NewPlayerTaskPageFetchFailedEvent): void {
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        this.ui.showToast(i18n.getValueByKey("utlis.text6"));
        LogKit.W("[NewPlayerTaskDialog] fetch failed {0}", e.message);
    }

    private onClaimSuccess(e: NewPlayerTaskClaimSuccessEvent): void {
        this.claimInFlight = false;
        this.ui.hideBlockingLoading();
        const msg = e.res.tip ?? e.res.msg ?? "";
        if (msg.length > 0) {
            this.ui.showToast(msg);
        }
        if (e.res.page) {
            this.applyPage(e.res.page);
        }
    }

    private onClaimFailed(e: NewPlayerTaskClaimFailedEvent): void {
        this.claimInFlight = false;
        this.ui.hideBlockingLoading();
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        this.ui.showToast(i18n.getValueByKey("utlis.text6"));
        LogKit.W("[NewPlayerTaskDialog] claim failed {0}", e.message);
    }

    private applyPage(page: NewPlayerTaskPageDto): void {
        this.startLeftTime(Number(page.left_second ?? 0));
        this.nptUtil.applyPage(this.uiRefs(), page);
        if (this.ruleLabel && page.rule) {
            this.ruleLabel.string = page.rule;
        }
    }

    private startLeftTime(seconds: number): void {
        this.stopCountdown();
        if (Number.isNaN(seconds) || seconds <= 0) {
            if (this.timeLabel) {
                this.timeLabel.string = "";
            }
            return;
        }
        this.leftTime = seconds;
        this.tickTimeLabel();
        this.countdownHandle = Utility.tween.scheduleRepeating(this.node, 1, () => {
            this.leftTime -= 1;
            if (this.leftTime < 0) {
                this.onCloseClick();
                return;
            }
            this.tickTimeLabel();
        });
    }

    private tickTimeLabel(): void {
        if (!this.timeLabel) {
            return;
        }
        this.timeLabel.string = this.nptUtil.formatTimeLeft(this.leftTime);
    }

    private stopCountdown(): void {
        this.countdownHandle?.stop();
        this.countdownHandle = null;
    }

    private onTaskBtnClick(index: number): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        const page = GameApp.Interface.GetModel(NewPlayerTaskModel).page.value;
        const task = page?.task?.[index];
        if (!task) {
            return;
        }
        const status = Number(task.task_status ?? 0);
        const subType = Number(task.sub_type ?? 0);
        if (status === 1) {
            if (this.claimInFlight) {
                return;
            }
            this.claimInFlight = true;
            this.ui.showBlockingLoading();
            GameApp.Interface.SendCommand(
                new ClaimNewPlayerTaskRewardCommand({
                    vid: this.openData.vid,
                    type: Number(task.type ?? 0),
                    task_id: Number(task.task_id ?? 0),
                    sub_task_id: Number(task.sub_task_id ?? 0),
                }),
            );
            return;
        }
        if (this.openData.inRoom) {
            this.onCloseClick();
            return;
        }
        if (subType === 1 || subType === 2) {
            this.ui.showToast("Entering Rummy...");
            GameApp.Interface.SendCommand(new EnterSubGameCommand(SubGameId.Rummy));
            this.onCloseClick();
            return;
        }
        if (subType === 3) {
            this.ui.showToast("Please add cash from the store.");
        }
    }

    private onBoxClick(index: number): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        if (this.curTipIdx === index) {
            this.curTipIdx = -1;
            if (this.tipsBubbleNode) {
                this.tipsBubbleNode.active = false;
            }
            return;
        }
        const page = GameApp.Interface.GetModel(NewPlayerTaskModel).page.value;
        const milestone = page?.active?.[index];
        if (!milestone) {
            return;
        }
        this.curTipIdx = index;
        this.nptUtil.showBoxTips(this.uiRefs(), index, page?.active_num ?? 0, milestone);
    }

    private onHelpClick(): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        const page = GameApp.Interface.GetModel(NewPlayerTaskModel).page.value;
        if (!this.ruleNode || !page?.rule) {
            return;
        }
        this.ruleNode.active = true;
        if (this.ruleLabel) {
            this.ruleLabel.string = page.rule;
        }
    }

    private onRuleCloseClick(): void {
        if (this.ruleNode) {
            this.ruleNode.active = false;
        }
    }

    private onCloseClick(): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        this.CloseSelf();
    }
}

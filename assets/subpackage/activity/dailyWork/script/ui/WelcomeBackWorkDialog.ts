import {
    _decorator,
    Button,
    Color,
    Label,
    Node,
    ProgressBar,
    Sprite,
    SpriteFrame,
    v3,
} from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { I18NSystem } from "../../../../../script/game/system/I18NSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { Utility } from "../../../../../script/game/utility/Utility";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { ensureDailyWorkRegistered } from "../DailyWorkModule";
import { ClaimDailyWorkRewardCommand } from "../command/ClaimDailyWorkRewardCommand";
import { FetchDailyWorkPageCommand } from "../command/FetchDailyWorkPageCommand";
import { DailyWorkOpenData, DailyWorkPageDto } from "../config/DailyWorkConfig";
import {
    DailyWorkClaimFailedEvent,
    DailyWorkClaimSuccessEvent,
    DailyWorkFetchFailedEvent,
} from "../event/DailyWorkEvents";
import { DailyWorkModel } from "../model/DailyWorkModel";

const { ccclass, property } = _decorator;

type PendingReward = { index: number; tid: number };

@ccclass("WelcomeBackWorkDialog")
export class WelcomeBackWorkDialog extends BaseDialog {
    @property([SpriteFrame])
    public task_StateBgs: SpriteFrame[] = [];

    @property([SpriteFrame])
    public login_Bgs: SpriteFrame[] = [];

    @property([SpriteFrame])
    public task_Bgs: SpriteFrame[] = [];

    @property(Label)
    public task_timeLabel: Label = null;

    @property(Node)
    public root: Node = null;

    @property([SpriteFrame])
    public awardIconFrames: SpriteFrame[] = [];

    @property([SpriteFrame])
    public chargeTaskBtnBgs: SpriteFrame[] = [];

    @property([Node])
    public loginTask_items: Node[] = [];

    @property([Node])
    public playTask_items: Node[] = [];

    @property(Node)
    public chargeTask_item: Node = null;

    @property(Node)
    public collectAllNode: Node = null;

    @property([Node])
    public chargeItems: Node[] = [];

    @property(Node)
    public ruleRoot: Node = null;

    @property(Label)
    public ruleLabel: Label = null;

    @property(Node)
    public fingerAnim: Node = null;

    @property(Node)
    public awardBoxAnimNode: Node = null;

    @property(Node)
    public flashAnimNode: Node = null;

    @property(Node)
    public openCardAnimNode: Node = null;

    private openData = new DailyWorkOpenData();
    private leftTime = -1;
    private countdownHandle: { stop: () => void } | null = null;
    private chargeTaskState = 0;
    private canGetRewardItemCount = 0;
    private canGetRewardData: PendingReward[] = [];
    private fingerAnimPos = v3(-1, -1, 0);
    private hasSendAwardReq = false;
    private lastClick = 0;
    private hasClose = false;
    private chargeSelectIndex = 0;

    private get ui(): UISystem {
        return GameApp.Interface.GetSystem(UISystem);
    }

    protected OnInit(uiData: DailyWorkOpenData = null): void {
        ensureDailyWorkRegistered();
        if (uiData) {
            this.openData = uiData;
        }
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        this.ensureEditorRefs();
        this.wireButtons();
        this.registerEvents();
        GameApp.Interface.SendCommand(new FetchDailyWorkPageCommand());
    }

    protected OnClose(): void {
        this.stopCountdown();
        this.ui.hideBlockingLoading();
    }

    private ensureEditorRefs(): void {
        if (!this.root) {
            this.root = this.node.getChildByName("root");
        }
    }

    private wireButtons(): void {
        const collectBtn = this.root?.getChildByName("collect_btn");
        collectBtn?.on(Button.EventType.CLICK, () => this.onCollectBtnClick(), this);
        const helpBtn = this.root?.getChildByName("help_btn");
        helpBtn?.on(Button.EventType.CLICK, () => this.onHelpBtnClick(), this);
        const closeBtn = this.root?.getChildByName("close_btn");
        closeBtn?.on(Button.EventType.CLICK, () => this.onCloseClick(), this);
        const ruleClose = this.ruleRoot?.getChildByName("close_btn");
        ruleClose?.on(Button.EventType.CLICK, () => this.onRuleCloseClick(), this);

        for (let i = 0; i < this.loginTask_items.length; i++) {
            const btn = this.loginTask_items[i]?.getChildByName("getbtn");
            btn?.on(Button.EventType.CLICK, () => this.onGetLoginRewardClick(i), this);
        }
        for (let i = 0; i < this.playTask_items.length; i++) {
            const btn = this.playTask_items[i]?.getChildByName("getbtn");
            btn?.on(Button.EventType.CLICK, () => this.onGetDayTaskRewardClick(i), this);
        }
        const chargeBtn = this.chargeTask_item?.getChildByName("charge_btn");
        chargeBtn?.on(Button.EventType.CLICK, () => this.onChargeTaskBtnClick(), this);
    }

    private registerEvents(): void {
        const model = GameApp.Interface.GetModel(DailyWorkModel);
        model.page
            .RegisterWithInitValue((page) => {
                if (page) {
                    this.applyPage(page);
                }
            }, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(DailyWorkFetchFailedEvent, this.onFetchFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(DailyWorkClaimSuccessEvent, this.onClaimSuccess, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(DailyWorkClaimFailedEvent, this.onClaimFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private onFetchFailed(e: DailyWorkFetchFailedEvent): void {
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        this.ui.showToast(i18n.getValueByKey("utlis.text6"));
        LogKit.W("[WelcomeBackWorkDialog] fetch failed {0}", e.message);
    }

    private onClaimSuccess(e: DailyWorkClaimSuccessEvent): void {
        this.hasSendAwardReq = false;
        this.ui.hideBlockingLoading();
        const msg = e.res.tip ?? e.res.msg ?? "";
        if (msg.length > 0) {
            this.ui.showToast(msg);
        }
        const treward = e.res.treward ?? [];
        if (treward.length > 0) {
            this.playOpenCardAnimSimple(treward);
        }
    }

    private onClaimFailed(e: DailyWorkClaimFailedEvent): void {
        this.hasSendAwardReq = false;
        this.ui.hideBlockingLoading();
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        this.ui.showToast(i18n.getValueByKey("utlis.text6"));
        LogKit.W("[WelcomeBackWorkDialog] claim failed {0}", e.message);
    }

    private applyPage(data: DailyWorkPageDto): void {
        this.canGetRewardItemCount = 0;
        this.fingerAnimPos = v3(-1, -1, 0);
        this.canGetRewardData = [];
        this.leftTime = Number(data.lefttime ?? 0);
        this.stopCountdown();
        if (this.leftTime > 0) {
            this.countdownHandle = Utility.tween.scheduleRepeating(this.node, 1, () => {
                this.leftTime -= 1;
                if (this.leftTime < 0) {
                    this.leftTime = 0;
                    this.stopCountdown();
                    GameApp.Interface.SendCommand(new FetchDailyWorkPageCommand());
                }
                this.refreshLeftTime();
            });
        }
        this.refreshLeftTime();
        this.updateLoginTaskState(data);
        this.updatePlayTaskState(data);
        this.chargeTaskState = Number(data.charge_t?.st ?? 0);
        this.updateChargeTaskState(data);
        this.updateFingerAndCollectBtnState();
    }

    private stopCountdown(): void {
        this.countdownHandle?.stop();
        this.countdownHandle = null;
    }

    private refreshLeftTime(): void {
        if (!this.task_timeLabel) {
            return;
        }
        const t = Math.max(0, Math.floor(this.leftTime));
        const h = Math.floor(t / 3600);
        const m = Math.floor((t % 3600) / 60);
        const s = t % 60;
        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        this.task_timeLabel.string = `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    private updateFingerAndCollectBtnState(): void {
        const collectBtn = this.root?.getChildByName("collect_btn");
        if (collectBtn) {
            collectBtn.active = false;
        }
        if (this.fingerAnim) {
            this.fingerAnim.active = this.canGetRewardItemCount > 0;
            if (this.canGetRewardItemCount > 0 && this.fingerAnimPos.x >= 0) {
                this.fingerAnim.setPosition(this.fingerAnimPos);
            }
        }
    }

    private updatePlayTaskState(data: DailyWorkPageDto): void {
        const playT = data.play_t;
        if (!playT || playT.length !== 3) {
            return;
        }
        for (let e = 0; e < 3; e++) {
            const t = playT[e];
            const item = this.playTask_items[e];
            if (!item || !t) {
                continue;
            }
            const st = Number(t.st ?? 0);
            const awardbg = item.getChildByName("awardbg");
            if (awardbg) {
                awardbg.active = st === 3;
            }
            const stateExp = item.getChildByName("state_exp");
            if (stateExp) {
                stateExp.active = st === 4;
            }
            const getbtn = item.getChildByName("getbtn")?.getComponent(Button);
            if (getbtn) {
                getbtn.enabled = st === 2;
            }
            const taskWz = item.getChildByName("task_wz");
            if (taskWz) {
                taskWz.active = true;
            }
            const percentNode = item.getChildByName("percent");
            if (percentNode) {
                percentNode.active = true;
            }
            const bg = item.getChildByName("bg");
            if (bg) {
                bg.active = true;
            }
            const gray = new Color(148, 148, 148);
            const orange = new Color(228, 120, 23);
            const dark = new Color(51, 51, 51);
            if (st === 4) {
                this.setSpriteFrame(bg, this.task_Bgs[0]);
                this.setNodeColor(item.getChildByName("flag"), gray);
                this.setLabelColor(taskWz, gray);
            } else {
                this.setSpriteFrame(bg, this.task_Bgs[1]);
                this.setNodeColor(item.getChildByName("flag"), orange);
                this.setLabelColor(taskWz, dark);
            }
            if (t.cnt && taskWz) {
                const lbl = taskWz.getComponent(Label);
                if (lbl) {
                    lbl.string = t.cnt;
                }
            }
            if (taskWz) {
                taskWz.setPosition(st === 0 ? v3(0, -46.607) : v3(0, -26.607));
            }
            if (st !== 3) {
                if (percentNode) {
                    percentNode.active = st === 1 || st === 2;
                }
                const statebg = item.getChildByName("statebg");
                if (statebg) {
                    statebg.active = st === 0;
                }
                const a = Number(t.percent ?? 0);
                const bar = percentNode?.getComponent(ProgressBar);
                if (bar) {
                    bar.progress = a / 100;
                }
                if (st === 2) {
                    this.canGetRewardItemCount++;
                    this.canGetRewardData.push({ index: e + 3, tid: Number(t.tid) });
                    if (this.fingerAnimPos.x < 0) {
                        item.getPosition(this.fingerAnimPos);
                    }
                }
            } else if (awardbg) {
                const gou = awardbg.getChildByName("gou");
                if (gou) {
                    gou.active = true;
                }
                if (t.rnum != null) {
                    const numLbl = awardbg.getChildByName("num")?.getComponent(Label);
                    if (numLbl) {
                        numLbl.string = String(t.rnum);
                    }
                }
                const rtype = Number(t.rtype ?? -1);
                if (rtype >= 0 && rtype < 3) {
                    const ico = awardbg.getChildByName("ico");
                    this.setSpriteFrame(ico, this.awardIconFrames[rtype]);
                    if (ico) {
                        ico.active = true;
                    }
                }
            }
        }
    }

    private updateLoginTaskState(data: DailyWorkPageDto): void {
        const loginT = data.login_t;
        if (!loginT || loginT.length !== 3) {
            return;
        }
        for (let e = 0; e < 3; e++) {
            const t = loginT[e];
            const item = this.loginTask_items[e];
            if (!item || !t) {
                continue;
            }
            const st = Number(t.st ?? 0);
            const awardbg = item.getChildByName("awardbg");
            if (awardbg) {
                awardbg.active = st === 2;
            }
            const stateExp = item.getChildByName("state_exp");
            if (stateExp) {
                stateExp.active = st === 3;
            }
            const awardFuhao = item.getChildByName("award_fuhao");
            const awardNum = item.getChildByName("award_num");
            const uptip = item.getChildByName("uptip");
            const bg = item.getChildByName("bg");
            if (awardFuhao) {
                awardFuhao.active = true;
            }
            if (awardNum) {
                awardNum.active = true;
            }
            if (uptip) {
                uptip.active = true;
            }
            if (bg) {
                bg.active = true;
            }
            const getbtn = item.getChildByName("getbtn")?.getComponent(Button);
            if (getbtn) {
                getbtn.enabled = st === 1;
            }
            const flag = item.getChildByName("flag");
            if (flag) {
                flag.active = st !== 2;
            }
            const gray = new Color(148, 148, 148);
            const orange = new Color(228, 120, 23);
            const red = new Color(231, 13, 13);
            if (st === 3) {
                this.setSpriteFrame(bg, this.login_Bgs[0]);
                this.setNodeColor(flag, gray);
                this.setLabelColor(uptip, gray);
                this.setLabelColor(awardFuhao, gray);
                this.setLabelColor(awardNum, gray);
                if (awardFuhao) {
                    awardFuhao.active = false;
                }
                if (awardNum) {
                    awardNum.active = false;
                }
                if (uptip) {
                    uptip.active = false;
                }
            } else {
                this.setSpriteFrame(bg, this.login_Bgs[1]);
                this.setNodeColor(flag, orange);
                this.setLabelColor(uptip, red);
                this.setLabelColor(awardFuhao, red);
                this.setLabelColor(awardNum, red);
            }
            if (st !== 2) {
                const numLbl = awardNum?.getComponent(Label);
                if (numLbl && t.up) {
                    numLbl.string = t.up;
                }
            } else if (awardbg) {
                if (t.rnum != null) {
                    const lbl = awardbg.getChildByName("num")?.getComponent(Label);
                    if (lbl) {
                        lbl.string = String(t.rnum);
                    }
                }
                const rtype = Number(t.rtype ?? -1);
                if (rtype >= 0 && rtype < 3) {
                    const ico = awardbg.getChildByName("ico");
                    this.setSpriteFrame(ico, this.awardIconFrames[rtype]);
                    if (ico) {
                        ico.active = true;
                    }
                }
                const gou = awardbg.getChildByName("gou");
                if (gou) {
                    gou.active = true;
                }
            }
            if (st === 1) {
                this.canGetRewardItemCount++;
                this.canGetRewardData.push({ index: e, tid: Number(t.tid) });
                if (this.fingerAnimPos.x < 0) {
                    item.getPosition(this.fingerAnimPos);
                }
            }
        }
    }

    private updateChargeTaskState(data: DailyWorkPageDto): void {
        const charge = data.charge_t;
        const item = this.chargeTask_item;
        if (!charge || !item) {
            return;
        }
        const awardbg = item.getChildByName("awardbg");
        if (awardbg) {
            awardbg.active = this.chargeTaskState === 2;
        }
        const upto = item.getChildByName("upto");
        const awardFuhao = item.getChildByName("award_fuhao");
        const awardNum = item.getChildByName("award_num");
        const chargeBtn = item.getChildByName("charge_btn");
        const bg = item.getChildByName("bg");
        const tip = item.getChildByName("tip");
        if (upto) {
            upto.active = true;
        }
        if (awardFuhao) {
            awardFuhao.active = true;
        }
        if (awardNum) {
            awardNum.active = true;
        }
        if (chargeBtn) {
            chargeBtn.active = true;
        }
        if (bg) {
            bg.active = true;
        }
        if (tip) {
            tip.active = this.chargeTaskState !== 2;
        }
        const numLbl = awardNum?.getComponent(Label);
        if (this.chargeTaskState === 0) {
            if (numLbl && charge.up) {
                numLbl.string = charge.up;
            }
            const ico = chargeBtn?.getChildByName("ico");
            this.setSpriteFrame(ico, this.chargeTaskBtnBgs[1]);
            const wz = chargeBtn?.getChildByName("wz")?.getComponent(Label);
            if (wz) {
                const i18n = GameApp.Interface.GetSystem(I18NSystem);
                wz.string = i18n.getValueByKey("store.add_cash");
            }
        } else if (this.chargeTaskState === 1) {
            if (numLbl && charge.up) {
                numLbl.string = charge.up;
            }
            const ico = chargeBtn?.getChildByName("ico");
            this.setSpriteFrame(ico, this.chargeTaskBtnBgs[0]);
            const wz = chargeBtn?.getChildByName("wz")?.getComponent(Label);
            if (wz) {
                const i18n = GameApp.Interface.GetSystem(I18NSystem);
                wz.string = i18n.getValueByKey("novices.collect");
            }
            this.canGetRewardItemCount++;
            this.canGetRewardData.push({ index: 6, tid: Number(charge.tid) });
            if (this.fingerAnimPos.x < 0) {
                this.fingerAnimPos = v3(170, -355);
            }
        } else {
            if (charge.rnum != null && numLbl) {
                const lbl = awardbg?.getChildByName("num")?.getComponent(Label);
                if (lbl) {
                    lbl.string = String(charge.rnum);
                }
                const btn = chargeBtn?.getComponent(Button);
                if (btn) {
                    btn.enabled = false;
                }
            }
            const gou = awardbg?.getChildByName("gou");
            if (gou) {
                gou.active = true;
            }
            const ico = awardbg?.getChildByName("ico");
            if (ico) {
                ico.active = true;
            }
        }
    }

    private playOpenCardAnimSimple(
        treward: { tid?: number; rnum?: number; rtype?: number }[],
    ): void {
        if (this.fingerAnim) {
            this.fingerAnim.active = false;
        }
        for (const entry of this.canGetRewardData) {
            if (!treward.some((r) => r.tid === entry.tid)) {
                continue;
            }
            let host: Node | null = null;
            if (entry.index < 3) {
                host = this.loginTask_items[entry.index];
            } else if (entry.index < 6) {
                host = this.playTask_items[entry.index - 3];
            } else {
                host = this.chargeTask_item;
            }
            const awardbg = host?.getChildByName("awardbg");
            if (!awardbg) {
                continue;
            }
            awardbg.active = true;
            const tr = treward.find((r) => r.tid === entry.tid);
            if (tr?.rnum != null) {
                const lbl = awardbg.getChildByName("num")?.getComponent(Label);
                if (lbl) {
                    lbl.string = String(tr.rnum);
                }
            }
            const rtype = Number(tr?.rtype ?? -1);
            if (rtype >= 0 && rtype < 3 && entry.index < 6) {
                const ico = awardbg.getChildByName("ico");
                this.setSpriteFrame(ico, this.awardIconFrames[rtype]);
                if (ico) {
                    ico.active = true;
                }
            }
            const gou = awardbg.getChildByName("gou");
            if (gou) {
                gou.active = true;
            }
        }
    }

    private dealGetTaskAward(tids: number[]): void {
        if (this.hasSendAwardReq || tids.length === 0) {
            return;
        }
        this.hasSendAwardReq = true;
        this.ui.showBlockingLoading();
        GameApp.Interface.SendCommand(new ClaimDailyWorkRewardCommand(tids[0]));
    }

    private onHelpBtnClick(): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        if (!this.ruleRoot) {
            return;
        }
        this.ruleRoot.active = true;
        const page = GameApp.Interface.GetModel(DailyWorkModel).page.value;
        if (this.ruleLabel && page?.rule) {
            this.ruleLabel.string = page.rule;
        }
    }

    private onRuleCloseClick(): void {
        if (this.ruleRoot) {
            this.ruleRoot.active = false;
        }
    }

    private onCloseClick(): void {
        if (this.hasClose) {
            return;
        }
        this.hasClose = true;
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        this.CloseSelf();
    }

    private onChargeTaskBtnClick(): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        if (this.chargeTaskState === 0) {
            const i18n = GameApp.Interface.GetSystem(I18NSystem);
            this.ui.showToast(i18n.getValueByKey("store.add_cash"));
            return;
        }
        if (this.chargeTaskState === 1) {
            const page = GameApp.Interface.GetModel(DailyWorkModel).page.value;
            const tid = Number(page?.charge_t?.tid ?? 0);
            if (tid > 0) {
                this.dealGetTaskAward([tid]);
            }
        }
    }

    private onCollectBtnClick(): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        if (this.canGetRewardData.length > 0) {
            this.dealGetTaskAward([this.canGetRewardData[0].tid]);
        }
    }

    private onGetLoginRewardClick(index: number): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        const page = GameApp.Interface.GetModel(DailyWorkModel).page.value;
        const tid = Number(page?.login_t?.[index]?.tid ?? 0);
        if (tid > 0) {
            this.dealGetTaskAward([tid]);
        }
    }

    private onGetDayTaskRewardClick(index: number): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        const page = GameApp.Interface.GetModel(DailyWorkModel).page.value;
        const tid = Number(page?.play_t?.[index]?.tid ?? 0);
        if (tid > 0) {
            this.dealGetTaskAward([tid]);
        }
    }

    private setSpriteFrame(node: Node | null, frame: SpriteFrame | undefined): void {
        if (!node || !frame) {
            return;
        }
        const sp = node.getComponent(Sprite);
        if (sp) {
            sp.spriteFrame = frame;
        }
    }

    private setNodeColor(node: Node | null, c: Color): void {
        const sp = node?.getComponent(Sprite);
        if (sp) {
            sp.color = c;
        }
    }

    private setLabelColor(node: Node | null, c: Color): void {
        const lbl = node?.getComponent(Label);
        if (lbl) {
            lbl.color = c;
        }
    }
}

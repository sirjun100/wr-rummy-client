import {
    _decorator,
    Button,
    Color,
    instantiate,
    Label,
    Node,
    ScrollView,
    Sprite,
    SpriteAtlas,
    SpriteFrame,
} from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { EnterSubGameCommand } from "../../../../../script/game/command/EnterSubGameCommand";
import { SubGameId } from "../../../../../script/game/config/BundleManifest";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { I18NSystem } from "../../../../../script/game/system/I18NSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { ensureEarthquakesRegistered } from "../EarthquakesModule";
import { FetchEarthquakesPageCommand } from "../command/FetchEarthquakesPageCommand";
import { FetchEarthquakesRankCommand } from "../command/FetchEarthquakesRankCommand";
import { FetchEarthquakesTaskCommand } from "../command/FetchEarthquakesTaskCommand";
import {
    EarthquakesOpenData,
    EarthquakesPageDto,
    EarthquakesQuery,
    EarthquakesVidRoomDto,
} from "../config/EarthquakesConfig";
import {
    EarthquakesPageFetchFailedEvent,
    EarthquakesRankFetchFailedEvent,
    EarthquakesTaskFetchFailedEvent,
} from "../event/EarthquakesEvents";
import { EarthquakesModel } from "../model/EarthquakesModel";
import { EarthquakesUtility } from "../utility/EarthquakesUtility";

const { ccclass, property } = _decorator;

@ccclass("EarthquakesDialog")
export class EarthquakesDialog extends BaseDialog {
    @property(Node)
    public root: Node = null;

    @property(Node)
    public outRoot: Node = null;

    @property(Node)
    public ruleNode: Node = null;

    @property(Node)
    public taskNode: Node = null;

    @property(Node)
    public taskMoban: Node = null;

    @property(Node)
    public rankNode: Node = null;

    @property(Node)
    public rankMoban: Node = null;

    @property(Node)
    public vidTabList: Node = null;

    @property([Node])
    public gameTabNodes: Node[] = [];

    @property([SpriteFrame])
    public gameTabFrames: SpriteFrame[] = [];

    @property([SpriteFrame])
    public leftTabFrames: SpriteFrame[] = [];

    @property(SpriteFrame)
    public blankFrames: SpriteFrame = null;

    @property([SpriteFrame])
    public rankIconFrames: SpriteFrame[] = [];

    @property([SpriteFrame])
    public rankTabFrames: SpriteFrame[] = [];

    @property([SpriteFrame])
    public rankAwardFrames: SpriteFrame[] = [];

    @property([SpriteFrame])
    public shuBgFrames: SpriteFrame[] = [];

    @property(Node)
    public playNowBtn: Node = null;

    @property(Node)
    public vidTabMoban: Node = null;

    @property(Node)
    public ruleTipNode: Node = null;

    @property(SpriteAtlas)
    public rewardSpriteAtlas: SpriteAtlas = null;

    private openData = new EarthquakesOpenData();
    private curVid = 0;
    private curPlayer = 6;
    private curMode = 0;
    private curRankMode = 0;
    private pointsMode = 1;
    private lastClick = 0;
    private hasClose = false;
    private taskItems: Node[] = [];

    private get ui(): UISystem {
        return GameApp.Interface.GetSystem(UISystem);
    }

    private get earthquakesUtil(): EarthquakesUtility {
        return GameApp.Interface.GetUtility(EarthquakesUtility);
    }

    private query(): EarthquakesQuery {
        return {
            vid: this.curVid,
            in_room: 0,
            player: this.curPlayer,
            chip: this.openData.chip,
            rank_mode: this.curRankMode,
        };
    }

    protected OnInit(uiData: EarthquakesOpenData = null): void {
        ensureEarthquakesRegistered();
        if (uiData) {
            this.openData = uiData;
        }
        this.curVid = this.openData.vid;
        this.curPlayer = this.openData.player || 6;
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        if (this.openData.chip === 1 && this.shuBgFrames[1] && this.outRoot) {
            const bg = this.outRoot.getChildByName("bg")?.getComponent(Sprite);
            if (bg) {
                bg.spriteFrame = this.shuBgFrames[1];
            }
        }
        this.wireButtons();
        this.registerEvents();
        GameApp.Interface.SendCommand(new FetchEarthquakesPageCommand(this.query()));
    }

    protected OnClose(): void {
        this.ui.hideBlockingLoading();
    }

    private wireButtons(): void {
        const closeBtn = this.root?.getChildByName("close_btn");
        closeBtn?.on(Button.EventType.CLICK, () => this.onCloseClick(), this);
        this.playNowBtn?.on(Button.EventType.CLICK, () => this.onPlayNow(), this);
        for (let i = 0; i < this.gameTabNodes.length; i++) {
            this.gameTabNodes[i]?.on(Button.EventType.CLICK, () => this.onGameTab(i), this);
        }
        const tab0 = this.root?.getChildByName("cnt_tabbg")?.getChildByName("tab0");
        const tab1 = this.root?.getChildByName("cnt_tabbg")?.getChildByName("tab1");
        tab0?.on(Button.EventType.CLICK, () => this.onPlayerTab(6), this);
        tab1?.on(Button.EventType.CLICK, () => this.onPlayerTab(2), this);
    }

    private registerEvents(): void {
        const model = GameApp.Interface.GetModel(EarthquakesModel);
        model.mainPage
            .RegisterWithInitValue((page) => {
                if (page) {
                    this.applyPage(page);
                }
            }, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        model.task
            .RegisterWithInitValue((task) => {
                if (task && this.taskNode && this.taskMoban && this.curMode === 0) {
                    this.taskItems = this.earthquakesUtil.renderHallTaskList(
                        this.taskNode,
                        this.taskMoban,
                        task,
                        this.taskItems,
                    );
                }
            }, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        model.rank
            .RegisterWithInitValue((rank) => {
                if (rank && this.rankNode && this.rankMoban && this.curMode === 1) {
                    this.earthquakesUtil.renderRankList(this.rankNode, this.rankMoban, rank);
                }
            }, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(EarthquakesPageFetchFailedEvent, this.onPageFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(EarthquakesTaskFetchFailedEvent, this.onTaskFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(EarthquakesRankFetchFailedEvent, this.onRankFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private onPageFailed(e: EarthquakesPageFetchFailedEvent): void {
        this.ui.showToast(GameApp.Interface.GetSystem(I18NSystem).getValueByKey("utlis.text6"));
        LogKit.W("[EarthquakesDialog] page failed {0}", e.message);
    }

    private onTaskFailed(e: EarthquakesTaskFetchFailedEvent): void {
        LogKit.W("[EarthquakesDialog] task failed {0}", e.message);
    }

    private onRankFailed(e: EarthquakesRankFetchFailedEvent): void {
        LogKit.W("[EarthquakesDialog] rank failed {0}", e.message);
    }

    private applyPage(page: EarthquakesPageDto): void {
        if (page.cvid) {
            this.curVid = Number(page.cvid);
        }
        if (page.cplayer) {
            this.curPlayer = Number(page.cplayer);
        }
        if (this.ruleTipNode) {
            const lbl = this.ruleTipNode.getComponent(Label);
            if (lbl && page.rule) {
                lbl.string = page.rule;
            }
        }
        const tip = this.outRoot?.getChildByName("tip")?.getComponent(Label);
        if (tip && page.tip) {
            tip.string = page.tip;
        }
        this.updateVidTabs(page);
        this.changePageMode(this.curMode);
        if (this.curMode === 0) {
            GameApp.Interface.SendCommand(new FetchEarthquakesTaskCommand(this.query()));
        } else {
            GameApp.Interface.SendCommand(new FetchEarthquakesRankCommand(this.query()));
        }
    }

    private updateVidTabs(page: EarthquakesPageDto): void {
        const scroll = this.vidTabList?.getComponent(ScrollView);
        const content = scroll?.content;
        if (!content || !this.vidTabMoban) {
            return;
        }
        content.destroyAllChildren();
        const rooms = this.earthquakesUtil.pickRoomList(page, this.curPlayer, this.pointsMode);
        for (const room of rooms) {
            const item = instantiate(this.vidTabMoban);
            item.active = true;
            content.addChild(item);
            this.initVidTab(item, room);
        }
    }

    private initVidTab(node: Node, room: EarthquakesVidRoomDto): void {
        const wz = node.getChildByName("wz")?.getComponent(Label);
        if (wz) {
            wz.string = room.point ?? "";
        }
        const btn = node.getComponent(Button);
        if (btn) {
            node.off(Button.EventType.CLICK);
            node.on(Button.EventType.CLICK, () => {
                this.curVid = Number(room.vid ?? 0);
                GameApp.Interface.SendCommand(new FetchEarthquakesTaskCommand(this.query()));
            }, this);
        }
    }

    private changePageMode(mode: number): void {
        this.curMode = mode;
        if (this.taskNode) {
            this.taskNode.active = mode === 0;
        }
        if (this.rankNode) {
            this.rankNode.active = mode === 1;
        }
    }

    private onGameTab(index: number): void {
        if (Date.now() - this.lastClick < 500) {
            return;
        }
        this.lastClick = Date.now();
        this.pointsMode = index === 0 ? 1 : index === 1 ? 2 : 3;
        const page = GameApp.Interface.GetModel(EarthquakesModel).mainPage.value;
        if (page) {
            this.updateVidTabs(page);
        }
        GameApp.Interface.SendCommand(new FetchEarthquakesTaskCommand(this.query()));
    }

    private onPlayerTab(player: number): void {
        if (this.curPlayer === player) {
            return;
        }
        this.curPlayer = player;
        this.paintPlayerTabs();
        const page = GameApp.Interface.GetModel(EarthquakesModel).mainPage.value;
        if (page) {
            this.updateVidTabs(page);
        }
        GameApp.Interface.SendCommand(new FetchEarthquakesTaskCommand(this.query()));
    }

    private paintPlayerTabs(): void {
        const bg = this.root?.getChildByName("cnt_tabbg");
        if (!bg) {
            return;
        }
        const tab0 = bg.getChildByName("tab0");
        const tab1 = bg.getChildByName("tab1");
        const white = new Color(255, 255, 255);
        const dark = new Color(51, 51, 51);
        if (this.curPlayer === 6) {
            tab0?.getChildByName("ico") && (tab0.getChildByName("ico").active = true);
            tab1?.getChildByName("ico") && (tab1.getChildByName("ico").active = false);
            tab0?.getChildByName("wz")?.getComponent(Label) && (tab0.getChildByName("wz").getComponent(Label).color = white);
            tab1?.getChildByName("wz")?.getComponent(Label) && (tab1.getChildByName("wz").getComponent(Label).color = dark);
        } else {
            tab1?.getChildByName("ico") && (tab1.getChildByName("ico").active = true);
            tab0?.getChildByName("ico") && (tab0.getChildByName("ico").active = false);
            tab1?.getChildByName("wz")?.getComponent(Label) && (tab1.getChildByName("wz").getComponent(Label).color = white);
            tab0?.getChildByName("wz")?.getComponent(Label) && (tab0.getChildByName("wz").getComponent(Label).color = dark);
        }
    }

    private onPlayNow(): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        GameApp.Interface.SendCommand(new EnterSubGameCommand(SubGameId.Rummy));
        this.ui.showToast("Entering Rummy...");
    }

    private onCloseClick(): void {
        if (this.hasClose) {
            return;
        }
        this.hasClose = true;
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        this.CloseSelf();
    }
}

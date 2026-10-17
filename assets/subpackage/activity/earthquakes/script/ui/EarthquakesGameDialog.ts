import { _decorator, Button, Label, Node, Sprite, SpriteAtlas, SpriteFrame } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { I18NSystem } from "../../../../../script/game/system/I18NSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { ensureEarthquakesRegistered } from "../EarthquakesModule";
import { ClaimEarthquakesChipRewardCommand } from "../command/ClaimEarthquakesChipRewardCommand";
import { FetchEarthquakesPageCommand } from "../command/FetchEarthquakesPageCommand";
import { FetchEarthquakesTaskCommand } from "../command/FetchEarthquakesTaskCommand";
import { EarthquakesOpenData, EarthquakesQuery } from "../config/EarthquakesConfig";
import {
    EarthquakesChipClaimFailedEvent,
    EarthquakesChipClaimSuccessEvent,
    EarthquakesPageFetchFailedEvent,
} from "../event/EarthquakesEvents";
import { EarthquakesModel } from "../model/EarthquakesModel";
import { EarthquakesUtility } from "../utility/EarthquakesUtility";

const { ccclass, property } = _decorator;

@ccclass("EarthquakesGameDialog")
export class EarthquakesGameDialog extends BaseDialog {
    @property(Node)
    public root: Node = null;

    @property(Node)
    public outRoot: Node = null;

    @property(Node)
    public taskNode: Node = null;

    @property(Node)
    public taskMoban: Node = null;

    @property(Node)
    public ruleTipNode: Node = null;

    @property([SpriteFrame])
    public shuBgFrames: SpriteFrame[] = [];

    @property(SpriteAtlas)
    public rewardSpriteAtlas: SpriteAtlas = null;

    private openData = new EarthquakesOpenData(1, 0, 0, true);
    private taskItems: Node[] = [];
    private hasClose = false;

    private get ui(): UISystem {
        return GameApp.Interface.GetSystem(UISystem);
    }

    private get earthquakesUtil(): EarthquakesUtility {
        return GameApp.Interface.GetUtility(EarthquakesUtility);
    }

    private query(): EarthquakesQuery {
        return {
            vid: this.openData.vid,
            in_room: 1,
            player: this.openData.player,
            chip: this.openData.chip,
        };
    }

    protected OnInit(uiData: EarthquakesOpenData = null): void {
        ensureEarthquakesRegistered();
        if (uiData) {
            this.openData = uiData;
        }
        if (!this.root) {
            this.root = this.node;
        }
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        if (this.openData.chip === 1 && this.shuBgFrames[1] && this.outRoot) {
            const bg = this.outRoot.getChildByName("bg")?.getComponent(Sprite);
            if (bg) {
                bg.spriteFrame = this.shuBgFrames[1];
            }
        }
        const closeBtn = this.root?.getChildByName("close_btn");
        closeBtn?.on(Button.EventType.CLICK, () => this.onCloseClick(), this);
        const claimBtn = this.root?.getChildByName("claim_btn");
        claimBtn?.on(Button.EventType.CLICK, () => this.onClaimChip(), this);

        const model = GameApp.Interface.GetModel(EarthquakesModel);
        model.task
            .RegisterWithInitValue((task) => {
                if (task && this.taskNode && this.taskMoban) {
                    this.taskItems = this.earthquakesUtil.renderGameTaskList(
                        this.taskNode,
                        this.taskMoban,
                        task,
                        this.taskItems,
                    );
                }
            }, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        model.mainPage
            .RegisterWithInitValue((page) => {
                if (page?.rule && this.ruleTipNode) {
                    const lbl = this.ruleTipNode.getComponent(Label);
                    if (lbl) {
                        lbl.string = page.rule;
                    }
                }
            }, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);

        GameApp.Interface.RegisterEvent(EarthquakesPageFetchFailedEvent, this.onPageFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(EarthquakesChipClaimSuccessEvent, this.onClaimSuccess, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(EarthquakesChipClaimFailedEvent, this.onClaimFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);

        GameApp.Interface.SendCommand(new FetchEarthquakesPageCommand(this.query()));
        GameApp.Interface.SendCommand(new FetchEarthquakesTaskCommand(this.query()));
    }

    protected OnClose(): void {
        this.ui.hideBlockingLoading();
    }

    private onPageFailed(e: EarthquakesPageFetchFailedEvent): void {
        LogKit.W("[EarthquakesGameDialog] page failed {0}", e.message);
    }

    private onClaimSuccess(e: EarthquakesChipClaimSuccessEvent): void {
        this.ui.hideBlockingLoading();
        const msg = e.res.tip ?? e.res.msg ?? "";
        if (msg) {
            this.ui.showToast(msg);
        }
    }

    private onClaimFailed(): void {
        this.ui.hideBlockingLoading();
        this.ui.showToast(GameApp.Interface.GetSystem(I18NSystem).getValueByKey("utlis.text6"));
    }

    private onClaimChip(): void {
        if (this.openData.chip !== 1) {
            return;
        }
        this.ui.showBlockingLoading();
        GameApp.Interface.SendCommand(
            new ClaimEarthquakesChipRewardCommand(this.openData.vid, this.openData.player),
        );
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

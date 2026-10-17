import { _decorator, Button, Node, SpriteFrame } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { I18NSystem } from "../../../../../script/game/system/I18NSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { RechargeOpenData } from "../config/RechargeEventConfig";
import { ClaimRestartGiftCommand } from "../command/ClaimRestartGiftCommand";
import { FetchRestartGiftPageCommand } from "../command/FetchRestartGiftPageCommand";
import { StartRestartGiftPurchaseCommand } from "../command/StartRestartGiftPurchaseCommand";
import {
    RestartGiftActionFailedEvent,
    RestartGiftActionSuccessEvent,
    RestartGiftPageFetchFailedEvent,
    RestartGiftPageReadyEvent,
} from "../event/RestartGiftEvents";
import { RestartGiftModel } from "../model/RestartGiftModel";
import { RestartGiftUtility } from "../utility/RestartGiftUtility";

const { ccclass, property } = _decorator;

@ccclass("SuperValueGiftDialog")
export class SuperValueGiftDialog extends BaseDialog {
    @property(Node)
    public rootNode: Node = null;

    @property(Node)
    public maskNode: Node = null;

    @property(Node)
    public rewardRoot: Node = null;

    @property(Node)
    public okBtnNode: Node = null;

    @property([SpriteFrame])
    public okBtnSpriteFrames: SpriteFrame[] = [];

    private openData = new RechargeOpenData();
    private lastClick = 0;

    protected OnInit(uiData: RechargeOpenData = null): void {
        if (uiData) {
            this.openData = uiData;
        }
        GameApp.Interface.GetUtility(RestartGiftUtility).applyRoomScale(this.rootNode, this.openData.inRoom);
        this.wireButtons();
        this.registerEvents();
        GameApp.Interface.GetSystem(UISystem).showBlockingLoading();
        GameApp.Interface.SendCommand(new FetchRestartGiftPageCommand(this.openData.vid));
    }

    protected OnClose(): void {}

    private wireButtons(): void {
        this.wireByName("close", () => this.CloseSelf());
        this.okBtnNode?.on(Button.EventType.CLICK, () => this.onOk(), this);
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
        GameApp.Interface.RegisterEvent(RestartGiftPageReadyEvent, () => this.onReady(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(RestartGiftPageFetchFailedEvent, () => this.onFetchFail(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(RestartGiftActionSuccessEvent, (e) => this.onActionOk(e), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(RestartGiftActionFailedEvent, () => this.onActionFail(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private onReady(): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        const page = GameApp.Interface.GetModel(RestartGiftModel).page.value;
        if (!page) {
            return;
        }
        GameApp.Interface.GetUtility(RestartGiftUtility).applyPage(
            this.rootNode,
            this.rewardRoot,
            this.okBtnNode,
            this.okBtnSpriteFrames,
            page,
        );
    }

    private onOk(): void {
        const page = GameApp.Interface.GetModel(RestartGiftModel).page.value;
        const status = Number(page?.status ?? 0);
        const now = Date.now();
        if (now - this.lastClick < 1000) {
            return;
        }
        this.lastClick = now;
        GameApp.Interface.GetSystem(UISystem).showBlockingLoading();
        if (status === 0) {
            GameApp.Interface.SendCommand(new StartRestartGiftPurchaseCommand());
        } else if (status === 1 || status === 3) {
            GameApp.Interface.SendCommand(new ClaimRestartGiftCommand());
        } else {
            GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        }
    }

    private onFetchFail(): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        GameApp.Interface.GetSystem(UISystem).showToast(
            GameApp.Interface.GetSystem(I18NSystem).getValueByKey("utlis.text6"),
        );
    }

    private onActionOk(e: RestartGiftActionSuccessEvent): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        if (e.msg) {
            GameApp.Interface.GetSystem(UISystem).showToast(e.msg);
        }
        GameApp.Interface.SendCommand(new FetchRestartGiftPageCommand(this.openData.vid));
    }

    private onActionFail(): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        GameApp.Interface.GetSystem(UISystem).showToast(
            GameApp.Interface.GetSystem(I18NSystem).getValueByKey("utlis.text6"),
        );
    }
}

import { _decorator, Button, Label, Node, Sprite, SpriteFrame } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { I18NSystem } from "../../../../../script/game/system/I18NSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { RechargeOpenData } from "../config/RechargeEventConfig";
import { FetchWholeDayPageCommand } from "../command/FetchWholeDayPageCommand";
import { StartWholeDayPurchaseCommand } from "../command/StartWholeDayPurchaseCommand";
import {
    WholeDayPageFetchFailedEvent,
    WholeDayPageReadyEvent,
    WholeDayPurchaseFailedEvent,
    WholeDayPurchaseSuccessEvent,
} from "../event/WholeDayEvents";
import { WholeDayModel } from "../model/WholeDayModel";
import { WholeDayUiRefs, WholeDayUtility } from "../utility/WholeDayUtility";

const { ccclass, property } = _decorator;

@ccclass("WholeDayGiftDialog")
export class WholeDayGiftDialog extends BaseDialog {
    @property(Node)
    public rootNode: Node = null;

    @property(Node)
    public maskNode: Node = null;

    @property(Label)
    public leftTimeLabel: Label = null;

    @property(Node)
    public mainRoot: Node = null;

    @property([SpriteFrame])
    public bgSpriteFrames: SpriteFrame[] = [];

    private openData = new RechargeOpenData();
    private countdown = -1;
    private lastBuy = 0;

    protected OnInit(uiData: RechargeOpenData = null): void {
        if (uiData) {
            this.openData = uiData;
        }
        this.wireButtons();
        this.registerEvents();
        GameApp.Interface.GetSystem(UISystem).showBlockingLoading();
        GameApp.Interface.SendCommand(new FetchWholeDayPageCommand(this.openData.vid));
    }

    protected OnClose(): void {}

    private uiRefs(): WholeDayUiRefs {
        return {
            mainRoot: this.mainRoot,
            leftTimeLabel: this.leftTimeLabel,
            bgSpriteFrames: this.bgSpriteFrames,
        };
    }

    private wireButtons(): void {
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("submit_btn", () => this.onBuy());
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
        GameApp.Interface.RegisterEvent(WholeDayPageReadyEvent, () => this.onReady(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(WholeDayPageFetchFailedEvent, () => this.onFetchFail(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(WholeDayPurchaseSuccessEvent, (e) => this.onPurchaseOk(e), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(WholeDayPurchaseFailedEvent, () => this.onPurchaseFail(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private onReady(): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        const page = GameApp.Interface.GetModel(WholeDayModel).page.value;
        if (!page) {
            return;
        }
        GameApp.Interface.GetUtility(WholeDayUtility).applyPage(this.uiRefs(), page, this.openData.inRoom);
        this.countdown = Number(page.time_left ?? 0);
        this.scheduleCountdown();
    }

    private scheduleCountdown(): void {
        if (!this.leftTimeLabel || this.countdown < 0) {
            return;
        }
        const util = GameApp.Interface.GetUtility(WholeDayUtility);
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        const prefix = i18n.getValueByKey("first_recharge_text.left_time");
        this.leftTimeLabel.string = `${prefix} ${util.formatCountdown(this.countdown)}`;
        this.scheduleOnce(() => {
            this.countdown -= 1;
            if (this.countdown < 0) {
                this.CloseSelf();
                return;
            }
            this.scheduleCountdown();
        }, 1);
    }

    private onFetchFail(): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        GameApp.Interface.GetSystem(UISystem).showToast(
            GameApp.Interface.GetSystem(I18NSystem).getValueByKey("utlis.text6"),
        );
    }

    private onBuy(): void {
        const page = GameApp.Interface.GetModel(WholeDayModel).page.value;
        if (!page || Number(page.closed) === 1) {
            return;
        }
        const now = Date.now();
        if (now - this.lastBuy < 1000) {
            return;
        }
        this.lastBuy = now;
        GameApp.Interface.GetSystem(UISystem).showBlockingLoading();
        GameApp.Interface.SendCommand(new StartWholeDayPurchaseCommand(Number(page.price ?? 0)));
    }

    private onPurchaseOk(e: WholeDayPurchaseSuccessEvent): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        if (e.msg) {
            GameApp.Interface.GetSystem(UISystem).showToast(e.msg);
        }
        GameApp.Interface.SendCommand(new FetchWholeDayPageCommand(this.openData.vid));
    }

    private onPurchaseFail(): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        GameApp.Interface.GetSystem(UISystem).showToast(
            GameApp.Interface.GetSystem(I18NSystem).getValueByKey("utlis.text6"),
        );
    }
}

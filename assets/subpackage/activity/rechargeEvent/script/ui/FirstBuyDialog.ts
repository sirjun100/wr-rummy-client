import { _decorator, Button, Label, Node, v3 } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { I18NSystem } from "../../../../../script/game/system/I18NSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { RechargeOpenData } from "../config/RechargeEventConfig";
import { FetchFirstBuyPageCommand } from "../command/FetchFirstBuyPageCommand";
import { StartFirstBuyPurchaseCommand } from "../command/StartFirstBuyPurchaseCommand";
import {
    FirstBuyPageFetchFailedEvent,
    FirstBuyPageReadyEvent,
    FirstBuyPurchaseFailedEvent,
    FirstBuyPurchaseSuccessEvent,
} from "../event/FirstBuyEvents";
import { FirstBuyModel } from "../model/FirstBuyModel";
import { FirstBuyUtility } from "../utility/FirstBuyUtility";

const { ccclass, property } = _decorator;

@ccclass("FirstBuyDialog")
export class FirstBuyDialog extends BaseDialog {
    @property(Node)
    public rootNode: Node = null;

    @property(Label)
    public timeLabel: Label = null;

    private openData = new RechargeOpenData();
    private countdown = -1;
    private lastPay = 0;

    protected OnInit(uiData: RechargeOpenData = null): void {
        if (uiData) {
            this.openData = uiData;
        }
        GameApp.Interface.GetUtility(FirstBuyUtility).applyRoomLayout(this.rootNode, this.openData.inRoom);
        this.wirePayButtons();
        this.registerEvents();
        GameApp.Interface.GetSystem(UISystem).showBlockingLoading();
        GameApp.Interface.SendCommand(new FetchFirstBuyPageCommand(this.openData.vid));
    }

    protected OnClose(): void {}

    private wirePayButtons(): void {
        this.wireByName("btn_close", () => this.CloseSelf());
        for (let i = 0; i < 4; i++) {
            const item = this.rootNode?.getChildByName(`item${i}`);
            const pay = item?.getChildByName("pay_btn");
            if (!pay?.getComponent(Button)) {
                continue;
            }
            pay.off(Button.EventType.CLICK);
            pay.on(Button.EventType.CLICK, () => this.onPay(i), this);
        }
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
        GameApp.Interface.RegisterEvent(FirstBuyPageReadyEvent, () => this.onReady(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(FirstBuyPageFetchFailedEvent, () => this.onFetchFail(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(FirstBuyPurchaseSuccessEvent, (e) => this.onPurchaseOk(e), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(FirstBuyPurchaseFailedEvent, () => this.onPurchaseFail(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private onReady(): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        const page = GameApp.Interface.GetModel(FirstBuyModel).page.value;
        if (!page) {
            return;
        }
        GameApp.Interface.GetUtility(FirstBuyUtility).applyPage(this.rootNode, page);
        this.countdown = Number(page.time_left ?? 0);
        if (this.timeLabel && this.countdown > 0) {
            this.tickTime();
        }
    }

    private tickTime(): void {
        if (!this.timeLabel || this.countdown < 0) {
            return;
        }
        const h = Math.floor(this.countdown / 3600);
        const m = Math.floor((this.countdown % 3600) / 60);
        const s = this.countdown % 60;
        this.timeLabel.string = `${h}:${m}:${s}`;
        this.scheduleOnce(() => {
            this.countdown -= 1;
            if (this.countdown >= 0) {
                this.tickTime();
            }
        }, 1);
    }

    private onPay(tier: number): void {
        const page = GameApp.Interface.GetModel(FirstBuyModel).page.value;
        const good = page?.good_list?.[tier];
        if (!good) {
            return;
        }
        const mask = Number(page?.purchased_mask ?? 0);
        if (mask & (1 << tier)) {
            return;
        }
        const now = Date.now();
        if (now - this.lastPay < 1000) {
            return;
        }
        this.lastPay = now;
        GameApp.Interface.GetSystem(UISystem).showBlockingLoading();
        GameApp.Interface.SendCommand(
            new StartFirstBuyPurchaseCommand(Number(good.price ?? 0), tier),
        );
    }

    private onFetchFail(): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        GameApp.Interface.GetSystem(UISystem).showToast(
            GameApp.Interface.GetSystem(I18NSystem).getValueByKey("utlis.text6"),
        );
    }

    private onPurchaseOk(e: FirstBuyPurchaseSuccessEvent): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        if (e.msg) {
            GameApp.Interface.GetSystem(UISystem).showToast(e.msg);
        }
        GameApp.Interface.SendCommand(new FetchFirstBuyPageCommand(this.openData.vid));
    }

    private onPurchaseFail(): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        GameApp.Interface.GetSystem(UISystem).showToast(
            GameApp.Interface.GetSystem(I18NSystem).getValueByKey("utlis.text6"),
        );
    }
}

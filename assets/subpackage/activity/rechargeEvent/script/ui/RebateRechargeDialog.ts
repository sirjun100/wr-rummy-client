import { _decorator, Button, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { I18NSystem } from "../../../../../script/game/system/I18NSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { RechargeOpenData } from "../config/RechargeEventConfig";
import { FetchRebatePageCommand } from "../command/FetchRebatePageCommand";
import { StartRebatePurchaseCommand } from "../command/StartRebatePurchaseCommand";
import {
    RebatePageFetchFailedEvent,
    RebatePageReadyEvent,
    RebatePurchaseFailedEvent,
    RebatePurchaseSuccessEvent,
} from "../event/RebateEvents";
import { RebateModel } from "../model/RebateModel";
import { RebateUtility } from "../utility/RebateUtility";

const { ccclass, property } = _decorator;

@ccclass("RebateRechargeDialog")
export class RebateRechargeDialog extends BaseDialog {
    @property(Node)
    public rootNode: Node = null;

    @property(Label)
    public flagLabel: Label = null;

    private openData = new RechargeOpenData();
    private lastPay = 0;

    protected OnInit(uiData: RechargeOpenData = null): void {
        if (uiData) {
            this.openData = uiData;
        }
        this.wireButtons();
        this.registerEvents();
        GameApp.Interface.GetSystem(UISystem).showBlockingLoading();
        GameApp.Interface.SendCommand(new FetchRebatePageCommand(this.openData.vid));
    }

    protected OnClose(): void {}

    private wireButtons(): void {
        this.wireByName("btn_close", () => this.CloseSelf());
        for (let i = 0; i < 3; i++) {
            const item = this.rootNode?.getChildByName("content")?.getChildByName(`item${i}`);
            item?.on(Button.EventType.CLICK, () => this.onTier(i), this);
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
        GameApp.Interface.RegisterEvent(RebatePageReadyEvent, () => this.onReady(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(RebatePageFetchFailedEvent, () => this.onFetchFail(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(RebatePurchaseSuccessEvent, (e) => this.onPurchaseOk(e), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(RebatePurchaseFailedEvent, () => this.onPurchaseFail(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private onReady(): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        const page = GameApp.Interface.GetModel(RebateModel).page.value;
        if (!page) {
            return;
        }
        GameApp.Interface.GetUtility(RebateUtility).applyPage(this.rootNode, this.flagLabel, page);
    }

    private onTier(tier: number): void {
        const page = GameApp.Interface.GetModel(RebateModel).page.value;
        const g = page?.good_list?.[tier];
        if (!g) {
            return;
        }
        const now = Date.now();
        if (now - this.lastPay < 1000) {
            return;
        }
        this.lastPay = now;
        GameApp.Interface.GetSystem(UISystem).showBlockingLoading();
        GameApp.Interface.SendCommand(new StartRebatePurchaseCommand(Number(g.price ?? 0), tier));
    }

    private onFetchFail(): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        GameApp.Interface.GetSystem(UISystem).showToast(
            GameApp.Interface.GetSystem(I18NSystem).getValueByKey("utlis.text6"),
        );
    }

    private onPurchaseOk(e: RebatePurchaseSuccessEvent): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        if (e.msg) {
            GameApp.Interface.GetSystem(UISystem).showToast(e.msg);
        }
        GameApp.Interface.SendCommand(new FetchRebatePageCommand(this.openData.vid));
    }

    private onPurchaseFail(): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        GameApp.Interface.GetSystem(UISystem).showToast(
            GameApp.Interface.GetSystem(I18NSystem).getValueByKey("utlis.text6"),
        );
    }
}

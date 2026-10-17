import { _decorator, Button, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { I18NSystem } from "../../../../../script/game/system/I18NSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { RechargeOpenData } from "../config/RechargeEventConfig";
import { FetchConsecutivePageCommand } from "../command/FetchConsecutivePageCommand";
import { StartConsecutivePurchaseCommand } from "../command/StartConsecutivePurchaseCommand";
import {
    ConsecutivePageFetchFailedEvent,
    ConsecutivePageReadyEvent,
    ConsecutivePurchaseFailedEvent,
    ConsecutivePurchaseSuccessEvent,
} from "../event/ConsecutiveEvents";
import { ConsecutiveModel } from "../model/ConsecutiveModel";
import { ConsecutiveUtility } from "../utility/ConsecutiveUtility";

const { ccclass, property } = _decorator;

@ccclass("EndlessBenefitsGiftDialog")
export class EndlessBenefitsGiftDialog extends BaseDialog {
    @property(Node)
    public dayScrollContent: Node = null;

    @property(Label)
    public extra: Label = null;

    private openData = new RechargeOpenData();

    protected OnInit(uiData: RechargeOpenData = null): void {
        if (uiData) {
            this.openData = uiData;
        }
        this.wireDayButtons();
        this.registerEvents();
        GameApp.Interface.GetSystem(UISystem).showBlockingLoading();
        GameApp.Interface.SendCommand(new FetchConsecutivePageCommand(this.openData.vid));
    }

    protected OnClose(): void {}

    private wireDayButtons(): void {
        this.wireByName("btn_close", () => this.CloseSelf());
        for (let i = 0; i < 7; i++) {
            const dayItem = this.dayScrollContent?.getChildByName(`dayItem${i}`);
            const btn = dayItem?.getChildByName("btn_addcash");
            btn?.on(Button.EventType.CLICK, () => this.onDay(i), this);
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
        GameApp.Interface.RegisterEvent(ConsecutivePageReadyEvent, () => this.onReady(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(ConsecutivePageFetchFailedEvent, () => this.onFetchFail(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(ConsecutivePurchaseSuccessEvent, (e) => this.onPurchaseOk(e), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(ConsecutivePurchaseFailedEvent, () => this.onPurchaseFail(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private onReady(): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        const page = GameApp.Interface.GetModel(ConsecutiveModel).page.value;
        if (!page) {
            return;
        }
        GameApp.Interface.GetUtility(ConsecutiveUtility).applyPage(this.dayScrollContent, this.extra, page);
    }

    private onDay(index: number): void {
        const page = GameApp.Interface.GetModel(ConsecutiveModel).page.value;
        const g = page?.good_list?.[index];
        if (!g || Number(g.state) !== 1) {
            return;
        }
        GameApp.Interface.GetSystem(UISystem).showBlockingLoading();
        GameApp.Interface.SendCommand(
            new StartConsecutivePurchaseCommand(
                Number(g.price ?? 0),
                Number(g.day ?? index + 1),
                String(page?.act_num ?? ""),
            ),
        );
    }

    private onFetchFail(): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        GameApp.Interface.GetSystem(UISystem).showToast(
            GameApp.Interface.GetSystem(I18NSystem).getValueByKey("utlis.text6"),
        );
    }

    private onPurchaseOk(e: ConsecutivePurchaseSuccessEvent): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        if (e.msg) {
            GameApp.Interface.GetSystem(UISystem).showToast(e.msg);
        }
        GameApp.Interface.SendCommand(new FetchConsecutivePageCommand(this.openData.vid));
    }

    private onPurchaseFail(): void {
        GameApp.Interface.GetSystem(UISystem).hideBlockingLoading();
        GameApp.Interface.GetSystem(UISystem).showToast(
            GameApp.Interface.GetSystem(I18NSystem).getValueByKey("utlis.text6"),
        );
    }
}

import { _decorator, Button, Label, Node, ProgressBar, sp, sys, v3 } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { I18NSystem } from "../../../../../script/game/system/I18NSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { SessionModel } from "../../../../../script/game/model/SessionModel";
import { ensurePiggyBankRegistered } from "../PiggyBankModule";
import { FetchPiggyBankPageCommand } from "../command/FetchPiggyBankPageCommand";
import { StartPiggyBankPurchaseCommand } from "../command/StartPiggyBankPurchaseCommand";
import { PiggyBankOpenData, PiggyBankPageDto } from "../config/PiggyBankConfig";
import {
    PiggyBankPageFetchFailedEvent,
    PiggyBankPageReadyEvent,
    PiggyBankPurchaseFailedEvent,
    PiggyBankPurchaseSuccessEvent,
} from "../event/PiggyBankEvents";
import { PiggyBankModel } from "../model/PiggyBankModel";
import { PiggyBankUiRefs, PiggyBankUtility } from "../utility/PiggyBankUtility";

const { ccclass, property } = _decorator;

@ccclass("PiggyBankDialog")
export class PiggyBankDialog extends BaseDialog {
    @property(Node)
    public recordNode: Node = null;

    @property(Label)
    public ruleLabel: Label = null;

    @property(ProgressBar)
    public progressBar: ProgressBar = null;

    @property(Node)
    public buyNode: Node = null;

    @property(Node)
    public gullakRootNode: Node = null;

    @property(sp.Skeleton)
    public guanziSkeleton: sp.Skeleton = null;

    @property(Node)
    public biaogeNode: Node = null;

    @property(Node)
    public topTipsNode: Node = null;

    @property(Node)
    public downTipNode: Node = null;

    private openData = new PiggyBankOpenData();
    private lastBuyClick = 0;
    private purchaseInFlight = false;
    private readonly roomScale = v3(0.8, 0.8, 0.8);

    private get ui(): UISystem {
        return GameApp.Interface.GetSystem(UISystem);
    }

    private get pbUtil(): PiggyBankUtility {
        return GameApp.Interface.GetUtility(PiggyBankUtility);
    }

    protected OnInit(uiData: PiggyBankOpenData = null): void {
        ensurePiggyBankRegistered();
        if (uiData) {
            this.openData = uiData;
        }
        this.applyRoomLayout();
        if (this.recordNode) {
            this.recordNode.active = false;
        }
        if (this.buyNode) {
            this.buyNode.active = false;
        }
        if (this.progressBar) {
            this.progressBar.progress = 0;
        }
        this.wireButtons();
        this.registerEvents();
        this.ui.showBlockingLoading();
        GameApp.Interface.SendCommand(new FetchPiggyBankPageCommand(this.openData.vid));
    }

    protected OnClose(): void {}

    private applyRoomLayout(): void {
        if (!this.openData.inRoom || !this.gullakRootNode) {
            return;
        }
        this.gullakRootNode.setScale(this.roomScale);
    }

    private uiRefs(): PiggyBankUiRefs {
        return {
            progressBar: this.progressBar,
            buyNode: this.buyNode,
            gullakRootNode: this.gullakRootNode,
            guanziSkeleton: this.guanziSkeleton,
            biaogeNode: this.biaogeNode,
            topTipsNode: this.topTipsNode,
            downTipNode: this.downTipNode,
            ruleLabel: this.ruleLabel,
        };
    }

    private wireButtons(): void {
        this.wireButtonNode(this.buyNode, () => this.onBuyClick());
        this.wireButtonsByName("btn_close", () => this.CloseSelf());
        this.wireButtonsByName("help", () => this.toggleHelp());
        this.wireButtonsByName("levelbtn", () => this.toggleLevelTip());
    }

    private wireButtonNode(node: Node | null, handler: () => void): void {
        if (!node?.getComponent(Button)) {
            return;
        }
        node.off(Button.EventType.CLICK);
        node.on(Button.EventType.CLICK, () => {
            GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
            handler();
        }, this);
    }

    private wireButtonsByName(name: string, handler: () => void): void {
        const stack: Node[] = [this.node];
        while (stack.length > 0) {
            const cur = stack.pop()!;
            if (cur.name === name) {
                this.wireButtonNode(cur, handler);
            }
            for (const child of cur.children) {
                stack.push(child);
            }
        }
    }

    private toggleLevelTip(): void {
        const tip = this.gullakRootNode?.getChildByName("leveltipnode");
        if (tip) {
            tip.active = !tip.active;
        }
    }

    private toggleHelp(): void {
        if (!this.recordNode) {
            return;
        }
        this.recordNode.active = !this.recordNode.active;
    }

    private registerEvents(): void {
        GameApp.Interface.RegisterEvent(PiggyBankPageReadyEvent, () => this.onPageReady(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(PiggyBankPageFetchFailedEvent, (e) => this.onFetchFailed(e), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(PiggyBankPurchaseSuccessEvent, (e) => this.onPurchaseSuccess(e), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(PiggyBankPurchaseFailedEvent, (e) => this.onPurchaseFailed(e), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private onPageReady(): void {
        this.ui.hideBlockingLoading();
        const page = GameApp.Interface.GetModel(PiggyBankModel).page.value;
        if (!page) {
            return;
        }
        const playEntry = this.shouldPlayProgressEntryAnim(page);
        this.pbUtil.applyPage(this.uiRefs(), page, playEntry);
        if (playEntry) {
            this.saveProgressMarker(page);
        }
    }

    private shouldPlayProgressEntryAnim(page: PiggyBankPageDto): boolean {
        const uid = GameApp.Interface.GetModel(SessionModel).uid;
        const key = `Gullak_${uid}`;
        const stored = sys.localStorage.getItem(key);
        const progress = String(page.progress ?? 0);
        if (stored === progress) {
            return false;
        }
        return true;
    }

    private saveProgressMarker(page: PiggyBankPageDto): void {
        const uid = GameApp.Interface.GetModel(SessionModel).uid;
        sys.localStorage.setItem(`Gullak_${uid}`, String(page.progress ?? 0));
    }

    private onFetchFailed(e: PiggyBankPageFetchFailedEvent): void {
        this.ui.hideBlockingLoading();
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        this.ui.showToast(i18n.getValueByKey("utlis.text6"));
        LogKit.W("[PiggyBankDialog] fetch failed {0}", e.message);
    }

    private onBuyClick(): void {
        const page = GameApp.Interface.GetModel(PiggyBankModel).page.value;
        if (!page) {
            return;
        }
        const status = Number(page.status ?? 0);
        if (status === 2) {
            return;
        }
        const max = Number(page.max ?? 0);
        const progress = Number(page.progress ?? 0);
        if (progress < max) {
            this.ui.showToast("Jar is not full yet");
            return;
        }
        const now = Date.now();
        if (now - this.lastBuyClick < 1000) {
            return;
        }
        this.lastBuyClick = now;
        if (this.purchaseInFlight) {
            return;
        }
        this.purchaseInFlight = true;
        this.ui.showBlockingLoading();
        GameApp.Interface.SendCommand(new StartPiggyBankPurchaseCommand(Number(page.money ?? 0)));
    }

    private onPurchaseSuccess(e: PiggyBankPurchaseSuccessEvent): void {
        this.purchaseInFlight = false;
        this.ui.hideBlockingLoading();
        const msg = e.res.msg ?? "";
        this.pbUtil.playSmashAnim(this.guanziSkeleton, () => {
            if (msg.length > 0) {
                this.ui.showToast(msg);
            } else {
                this.ui.showToast("Reward collected");
            }
            GameApp.Interface.SendCommand(new FetchPiggyBankPageCommand(this.openData.vid));
        });
    }

    private onPurchaseFailed(e: PiggyBankPurchaseFailedEvent): void {
        this.purchaseInFlight = false;
        this.ui.hideBlockingLoading();
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        this.ui.showToast(i18n.getValueByKey("utlis.text6"));
        LogKit.W("[PiggyBankDialog] purchase failed {0}", e.message);
    }
}

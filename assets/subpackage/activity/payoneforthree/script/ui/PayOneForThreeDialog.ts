import {
    _decorator,
    Button,
    Label,
    Node,
    SpriteFrame,
} from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { I18NSystem } from "../../../../../script/game/system/I18NSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { ensurePayOneForThreeRegistered } from "../PayOneForThreeModule";
import { ClaimPayOneForThreeRewardCommand } from "../command/ClaimPayOneForThreeRewardCommand";
import { FetchPayOneForThreePageCommand } from "../command/FetchPayOneForThreePageCommand";
import { StartPayOneForThreePurchaseCommand } from "../command/StartPayOneForThreePurchaseCommand";
import { PayOneForThreeOpenData, PayOneForThreePageDto } from "../config/PayOneForThreeConfig";
import {
    PayOneForThreeClaimFailedEvent,
    PayOneForThreeClaimSuccessEvent,
    PayOneForThreePageFetchFailedEvent,
    PayOneForThreePurchaseFailedEvent,
    PayOneForThreePurchaseSuccessEvent,
} from "../event/PayOneForThreeEvents";
import { PayOneForThreeModel } from "../model/PayOneForThreeModel";
import {
    PayOneForThreeUiRefs,
    PayOneForThreeUtility,
    SubmitButtonMode,
} from "../utility/PayOneForThreeUtility";

const { ccclass, property } = _decorator;

@ccclass("PayOneForThreeDialog")
export class PayOneForThreeDialog extends BaseDialog {
    @property(Node)
    public rootNode: Node = null;

    @property(Node)
    public maskNode: Node = null;

    @property(Node)
    public contentNode: Node = null;

    @property(Node)
    public bgNode: Node = null;

    @property(Node)
    public btnCloseNode: Node = null;

    @property(Node)
    public topNode: Node = null;

    @property(Node)
    public midNode: Node = null;

    @property(Node)
    public bottomNode: Node = null;

    @property(Node)
    public btnSubmit: Node = null;

    @property([SpriteFrame])
    public rewBtnBg: SpriteFrame[] = [];

    @property([SpriteFrame])
    public priceTabbg: SpriteFrame[] = [];

    @property([SpriteFrame])
    public dayIcons: SpriteFrame[] = [];

    @property([SpriteFrame])
    public rewardIcons: SpriteFrame[] = [];

    private openData = new PayOneForThreeOpenData();
    private priceTabIndex = 0;
    private submitMode: SubmitButtonMode = "none";
    private rechargeNodes: Node[] = [];
    private claimInFlight = false;
    private purchaseInFlight = false;

    private get ui(): UISystem {
        return GameApp.Interface.GetSystem(UISystem);
    }

    private get poftUtil(): PayOneForThreeUtility {
        return GameApp.Interface.GetUtility(PayOneForThreeUtility);
    }

    protected OnInit(uiData: PayOneForThreeOpenData = null): void {
        ensurePayOneForThreeRegistered();
        if (uiData) {
            this.openData = uiData;
        }
        if (this.openData.tabIndex >= 0 && this.openData.tabIndex <= 2) {
            this.priceTabIndex = this.openData.tabIndex;
        }
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        this.collectRechargeNodes();
        this.wireButtons();
        this.registerEvents();
        if (this.openData.initialPage) {
            GameApp.Interface.GetModel(PayOneForThreeModel).page.value = this.openData.initialPage;
            const idx = Number(this.openData.initialPage.idx ?? -1);
            if (idx >= 0 && idx <= 2) {
                this.priceTabIndex = idx;
            }
        }
        const skipFetch =
            !this.openData.needReqPage &&
            this.openData.vid > 0 &&
            this.openData.initialPage != null;
        if (!skipFetch && this.openData.needReqPage) {
            GameApp.Interface.SendCommand(new FetchPayOneForThreePageCommand(this.openData.vid));
        } else if (!this.openData.needReqPage && this.openData.initialPage) {
            this.applyPage(this.openData.initialPage);
        }
        this.showItemsForHall();
    }

    protected OnClose(): void {
        this.ui.hideBlockingLoading();
    }

    private collectRechargeNodes(): void {
        this.rechargeNodes = [];
        for (let t = 0; t < 3; t++) {
            const e = this.bottomNode?.getChildByName(`item${t}`);
            if (e) {
                this.rechargeNodes.push(e);
                e.active = this.openData.inRoom;
            }
        }
    }

    private showItemsForHall(): void {
        if (this.openData.inRoom) {
            return;
        }
        for (const n of this.rechargeNodes) {
            n.active = false;
        }
        for (let i = 0; i < this.rechargeNodes.length; i++) {
            const node = this.rechargeNodes[i];
            if (node) {
                node.active = true;
            }
        }
    }

    private uiRefs(): PayOneForThreeUiRefs {
        return {
            midNode: this.midNode,
            bottomNode: this.bottomNode,
            btnSubmit: this.btnSubmit,
            bgNode: this.bgNode,
            btnCloseNode: this.btnCloseNode,
            topNode: this.topNode,
            rechargeNodes: this.rechargeNodes,
            rewBtnBg: this.rewBtnBg,
            priceTabbg: this.priceTabbg,
            rewardIcons: this.rewardIcons,
            inRoom: this.openData.inRoom,
            inHall: !this.openData.inRoom,
        };
    }

    private wireButtons(): void {
        this.btnCloseNode?.on(Button.EventType.CLICK, () => this.onCloseClick(), this);
        this.btnSubmit?.on(Button.EventType.CLICK, () => this.onSubmitClick(), this);
        for (let i = 0; i < 3; i++) {
            const tab = this.midNode?.getChildByName(`btn${i}`);
            tab?.on(Button.EventType.CLICK, () => this.onPriceTabClick(i), this);
        }
    }

    private registerEvents(): void {
        GameApp.Interface.GetModel(PayOneForThreeModel)
            .page.RegisterWithInitValue((page) => {
                if (page) {
                    this.applyPage(page);
                }
            }, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(PayOneForThreePageFetchFailedEvent, this.onFetchFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(PayOneForThreeClaimSuccessEvent, this.onClaimSuccess, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(PayOneForThreeClaimFailedEvent, this.onClaimFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(PayOneForThreePurchaseSuccessEvent, this.onPurchaseSuccess, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(PayOneForThreePurchaseFailedEvent, this.onPurchaseFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private onFetchFailed(e: PayOneForThreePageFetchFailedEvent): void {
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        this.ui.showToast(i18n.getValueByKey("utlis.text6"));
        LogKit.W("[PayOneForThreeDialog] fetch failed {0}", e.message);
    }

    private onClaimSuccess(e: PayOneForThreeClaimSuccessEvent): void {
        this.claimInFlight = false;
        this.ui.hideBlockingLoading();
        const msg = e.res.tip ?? e.res.msg ?? "";
        if (msg.length > 0) {
            this.ui.showToast(msg);
        }
    }

    private onClaimFailed(e: PayOneForThreeClaimFailedEvent): void {
        this.claimInFlight = false;
        this.ui.hideBlockingLoading();
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        this.ui.showToast(i18n.getValueByKey("utlis.text6"));
        LogKit.W("[PayOneForThreeDialog] claim failed {0}", e.message);
    }

    private onPurchaseSuccess(): void {
        this.purchaseInFlight = false;
        this.ui.hideBlockingLoading();
        this.ui.showToast("Purchase successful");
    }

    private onPurchaseFailed(e: PayOneForThreePurchaseFailedEvent): void {
        this.purchaseInFlight = false;
        this.ui.hideBlockingLoading();
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        this.ui.showToast(i18n.getValueByKey("utlis.text6"));
        LogKit.W("[PayOneForThreeDialog] purchase failed {0}", e.message);
    }

    private applyPage(page: PayOneForThreePageDto): void {
        const idx = Number(page.idx ?? -1);
        if (idx >= 0 && idx <= 2 && !this.poftUtil.getHaveBuyState(page)) {
            this.priceTabIndex = idx;
        }
        this.submitMode = this.poftUtil.applyPage(this.uiRefs(), page, this.priceTabIndex);
        this.localizeSubmitLabels();
    }

    private localizeSubmitLabels(): void {
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        const cur = this.btnSubmit?.getChildByName("price")?.getChildByName("cur")?.getComponent(Label);
        if (!cur) {
            return;
        }
        if (this.submitMode === "claimed") {
            cur.string = i18n.getValueByKey("buyonegetthree.claimed");
        } else if (this.submitMode === "claim") {
            cur.string = i18n.getValueByKey("buyonegetthree.claim");
        } else if (this.submitMode === "tomorrow") {
            const page = GameApp.Interface.GetModel(PayOneForThreeModel).page.value;
            const good = this.poftUtil.resolveSelectedGood(
                page,
                this.priceTabIndex,
                this.poftUtil.getHaveBuyState(page),
            );
            let t = 0;
            for (const r of good?.reward ?? []) {
                if (
                    (Number(r.day) === 2 && Number(r.state) === 0) ||
                    (Number(r.day) === 3 && Number(r.state) === 0)
                ) {
                    t += Number(r.cash ?? 0) + Number(r.bouns ?? 0);
                    break;
                }
            }
            const template = i18n.getValueByKey("buyonegetthree.claim_tomo");
            cur.string = template.replace("{0}", String(t)).replace("$", String(t));
        }
    }

    private onPriceTabClick(index: number): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        if (this.poftUtil.getHaveBuyState(GameApp.Interface.GetModel(PayOneForThreeModel).page.value)) {
            return;
        }
        if (index === this.priceTabIndex) {
            return;
        }
        const list = this.poftUtil.getGoodList(GameApp.Interface.GetModel(PayOneForThreeModel).page.value);
        if (index >= list.length) {
            return;
        }
        this.priceTabIndex = index;
        const page = GameApp.Interface.GetModel(PayOneForThreeModel).page.value;
        if (page) {
            this.applyPage(page);
        }
    }

    private onSubmitClick(): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        const page = GameApp.Interface.GetModel(PayOneForThreeModel).page.value;
        const haveBuy = this.poftUtil.getHaveBuyState(page);
        const good = this.poftUtil.resolveSelectedGood(page, this.priceTabIndex, haveBuy);
        if (!good) {
            return;
        }
        if (this.submitMode === "claim") {
            if (this.claimInFlight) {
                return;
            }
            this.claimInFlight = true;
            this.ui.showBlockingLoading();
            GameApp.Interface.SendCommand(new ClaimPayOneForThreeRewardCommand());
            return;
        }
        if (this.submitMode === "tomorrow") {
            const i18n = GameApp.Interface.GetSystem(I18NSystem);
            this.ui.showToast(i18n.getValueByKey("buyonegetthree.claim_tomo_tips"));
            return;
        }
        if (this.submitMode === "claimed") {
            return;
        }
        if (this.submitMode === "purchase") {
            if (this.purchaseInFlight) {
                return;
            }
            const goodId = Number(good.good_id ?? 0);
            const price = Number(good.price ?? 0);
            if (goodId <= 0 || price <= 0) {
                return;
            }
            this.purchaseInFlight = true;
            this.ui.showBlockingLoading();
            GameApp.Interface.SendCommand(new StartPayOneForThreePurchaseCommand(goodId, price));
        }
    }

    private onCloseClick(): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        this.CloseSelf();
    }
}

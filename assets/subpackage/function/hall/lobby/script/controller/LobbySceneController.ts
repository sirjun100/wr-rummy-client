import { _decorator, Button, find, Label, sp } from "cc";
import { EnterSubGameCommand } from "../../../../../script/game/command/EnterSubGameCommand";
import { SubGameId } from "../../../../../script/game/config/BundleManifest";
import { BaseController } from "../../../../../script/game/controller/engine/BaseController";
import { WalletModel } from "../../../../../script/game/model/WalletModel";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { ensureHallRegistered } from "../../hallMenu/script/CarteModule";
import { HallConfigModel } from "../../hallMenu/script/model/HallConfigModel";
import { HallPlayerModel } from "../../hallMenu/script/model/HallPlayerModel";
import { ensureCommShareRegistered } from "../../../../social/inviteShare/script/CommShareModule";
import { ShareModel } from "../../../../social/inviteShare/script/model/ShareModel";
import {
    CloseInviteEvent,
    InviteRewardFlagEvent,
    OpenInviteTabEvent,
} from "../../../../social/inviteShare/script/event/ShareEvents";
import { HALL_ACT_BUTTON_NODES, LobbyTabIndex } from "../config/LobbyConfig";
import { bindLobbyScene, ensureLobbyRegistered, onLobbyEnter } from "../LobbyModule";
import { HallActivityRouter } from "../utility/HallActivityRouter";
import { LobbyTopBarBinder } from "./LobbyTopBarBinder";
import { LobbyClubInfoBinder } from "./LobbyClubInfoBinder";

const { ccclass } = _decorator;

@ccclass("LobbySceneController")
export class LobbySceneController extends BaseController {
    private curSelectTab = LobbyTabIndex.GameEntry;
    private inviteRoot: import("cc").Node | null = null;
    private inviteBtn: import("cc").Node | null = null;

    protected onLoad(): void {
        LogKit.I("[LobbySceneController] onLoad");
        ensureLobbyRegistered();
        bindLobbyScene(this);
        this.wireLobbyGameButtons();
        this.wireMenuButton();
        this.wirePaymentButtons();
        this.wireRankingsButton();
        this.wireInviteTab();
        this.applyDefaultHallActVisibility();
        onLobbyEnter();
        void import("../../../../tableChrome/tableTheme/script/DeskModule").then((m) => {
            m.preloadDeskBundle();
            m.wireRoomBgOnRoot(this.node, { scene: "hall" });
        });
        void import("../../hallHeader/script/LobbyTopViewModule").then((m) => m.ensureLobbyTopViewRegistered());
        void import("../../../../social/inviteShare/script/LobbyActivityQueue").then((m) => m.preloadSharePopBundle());
        if (!this.node.getComponent(LobbyTopBarBinder)) {
            this.node.addComponent(LobbyTopBarBinder);
        }
        if (!this.node.getComponent(LobbyClubInfoBinder)) {
            this.node.addComponent(LobbyClubInfoBinder);
        }
    }

    private wireInviteTab(): void {
        ensureHallRegistered();
        ensureCommShareRegistered();
        this.inviteRoot = find("invite_root", this.node) ?? find("Canvas/invite_root", this.node);
        this.inviteBtn = find("btn_invite", this.node) ?? find("Canvas/btn_invite", this.node);
        const btn = this.inviteBtn?.getComponent(Button);
        if (btn) {
            btn.node.on(Button.EventType.CLICK, () => this.openInviteTab(), this);
        }

        this.GetModel(HallPlayerModel)
            .player.RegisterWithInitValue((p) => this.applyInviteTabBadge(p.hall_invite_earn), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        this.GetModel(ShareModel)
            .hasInviteReward.RegisterWithInitValue(() => this.refreshInviteRedAnim(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        this.GetModel(HallConfigModel)
            .config.RegisterWithInitValue(() => this.applyInviteVisibility(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);

        this.RegisterEvent(OpenInviteTabEvent, () => this.openInviteTab(), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        this.RegisterEvent(CloseInviteEvent, () => this.onInviteClosed(), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        this.RegisterEvent(InviteRewardFlagEvent, () => this.refreshInviteRedAnim(), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );

        this.applyInviteVisibility();
        this.applyInviteTabBadge(this.GetModel(HallPlayerModel).player.value.hall_invite_earn);
        this.refreshInviteRedAnim();
    }

    private applyInviteVisibility(): void {
        if (this.GetModel(HallConfigModel).isInviteBlocked() && this.inviteBtn) {
            this.inviteBtn.active = false;
        }
    }

    private applyInviteTabBadge(earn?: string): void {
        if (!this.inviteBtn || !earn) {
            return;
        }
        const flag = find("flag/wz", this.inviteBtn) ?? find("flag", this.inviteBtn)?.getChildByName("wz");
        const lab = flag?.getComponent(Label);
        if (lab) {
            lab.string = earn;
        }
    }

    private refreshInviteRedAnim(): void {
        if (!this.inviteBtn) {
            return;
        }
        const anim = this.inviteBtn.getChildByName("anim");
        const img = this.inviteBtn.getChildByName("img");
        const hasReward = this.GetModel(ShareModel).hasInviteReward.value === 1;
        const onInviteTab = this.curSelectTab === LobbyTabIndex.Invite;
        if (onInviteTab) {
            if (anim) {
                anim.active = false;
            }
            if (img) {
                img.active = true;
            }
            return;
        }
        if (hasReward && anim) {
            anim.active = true;
            if (img) {
                img.active = false;
            }
            const sk = anim.getComponent(sp.Skeleton);
            if (sk) {
                sk.clearTracks();
                sk.setAnimation(0, "share_entrance", true);
            }
        } else {
            if (anim) {
                anim.active = false;
            }
            if (img) {
                img.active = true;
            }
        }
    }

    public openInviteTab(): void {
        if (this.GetModel(HallConfigModel).isInviteBlocked()) {
            return;
        }
        this.curSelectTab = LobbyTabIndex.Invite;
        this.refreshInviteRedAnim();
        const host = this.inviteRoot;
        void import("../../../../social/inviteShare/script/CommShareModule").then((m) =>
            m.openShareMain(host ? { host, asDialog: false } : { asDialog: true }),
        );
    }

    private onInviteClosed(): void {
        void import("../../../../social/inviteShare/script/CommShareModule").then((m) => m.hideEmbeddedShare());
        if (this.curSelectTab === LobbyTabIndex.Invite) {
            this.curSelectTab = LobbyTabIndex.GameEntry;
        }
        this.refreshInviteRedAnim();
    }

    private applyDefaultHallActVisibility(): void {
        this.refreshHallActButtons([]);
    }

    private wireMenuButton(): void {
        const menu = find("btn_menu", this.node) ?? find("Canvas/btn_menu", this.node);
        const btn = menu?.getComponent(Button);
        if (btn) {
            btn.node.on(Button.EventType.CLICK, () => {
                void import("../../hallMenu/script/CarteModule").then((m) => m.openCarte());
            }, this);
        }
    }

    public refreshHallActButtons(actIds: number[]): void {
        const layout =
            find("list/layout", this.node) ??
            find("Canvas/list/layout", this.node);
        const setActive = (name: string, on: boolean): void => {
            const n = find(name, layout ?? this.node) ?? find(`Canvas/${name}`, this.node);
            if (n) {
                n.active = on;
            }
        };
        const has = (id: number) => actIds.includes(id);
        for (const [actId, nodeName] of Object.entries(HALL_ACT_BUTTON_NODES)) {
            setActive(nodeName, has(Number(actId)));
        }
    }

    public setHallActButtonVisible(nodeName: string, on: boolean): void {
        const layout = find("list/layout", this.node) ?? find("Canvas/list/layout", this.node);
        const n = find(nodeName, layout ?? this.node) ?? find(`Canvas/${nodeName}`, this.node);
        if (n) {
            n.active = on;
        }
    }

    private wirePaymentButtons(): void {
        const bind = (name: string, fn: () => void): void => {
            const n = find(name, this.node) ?? find(`Canvas/${name}`, this.node);
            const btn = n?.getComponent(Button);
            if (btn) {
                btn.node.on(Button.EventType.CLICK, fn, this);
            }
        };
        bind("add_cash", () => {
            const snap = this.GetModel(WalletModel).snapshot.value;
            if (snap.shop_open === 0) {
                void import("../../../../commerce/wallet/script/config/PurseConfig").then((c) => {
                    this.GetSystem(UISystem).showToast(c.PurseI18n.shopClosed);
                });
                return;
            }
            void import("../../../../commerce/wallet/script/PurseModule").then((m) => m.openShopMain());
        });
        bind("wallet_root", () => {
            void import("../../../../commerce/wallet/script/PurseModule").then((m) => m.openPurseDialog());
        });
    }

    private wireRankingsButton(): void {
        const btn =
            find("btn_leaderboard", this.node) ?? find("Canvas/btn_leaderboard", this.node);
        btn?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => {
            const open = Number(this.GetModel(HallPlayerModel).player.value.challenger_open ?? 1);
            if (open !== 1) {
                return;
            }
            void import("../../../../social/hallLeaderboard/script/RankingsModule").then((m) => m.openRankingsDialog());
        }, this);
        this.GetModel(HallPlayerModel)
            .player.RegisterWithInitValue((p) => {
                if (btn) {
                    btn.active = Number(p.challenger_open ?? 1) === 1;
                }
            }, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private wireLobbyGameButtons(): void {
        const crash = find("crash_btn", this.node) ?? find("Canvas/crash_btn");
        crash?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => HallActivityRouter.enterRocket(), this);
        const yes11 = find("yes11_btn", this.node) ?? find("Canvas/yes11_btn");
        yes11?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => HallActivityRouter.enterCricket(), this);
        const sixdice = find("sixdice_btn", this.node) ?? find("Canvas/sixdice_btn");
        sixdice?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => HallActivityRouter.enterSixpoint(), this);
    }

    public openRummySelection(): void {
        void import("../../roomSelect/script/SelectionVenueModule").then((m) => m.openRummySelection());
    }

    public enterRummy(templateId = "points_10", vid = 1): void {
        HallActivityRouter.enterRummy(templateId, vid);
    }

    public enterRummyPoints(): void {
        this.enterRummy("points_10", 1);
    }

    public enterRummyPool101(): void {
        this.enterRummy("pool_101", 2);
    }

    public enterRummyPool201(): void {
        this.enterRummy("pool_201", 3);
    }

    public enterRummyDeals(): void {
        this.enterRummy("deals_6", 4);
    }

    public enterCricket(): void {
        this.SendCommand(new EnterSubGameCommand(SubGameId.Cricket));
    }

    public enterSixpoint(): void {
        HallActivityRouter.enterSixpoint();
    }

    public enterRocket(): void {
        HallActivityRouter.enterRocket();
    }

    public openAdvancedGift(): Promise<void> {
        return HallActivityRouter.openAdvancedGift();
    }

    public openBeginnerFlipTask(): Promise<void> {
        return HallActivityRouter.openBeginnerFlipTask();
    }

    public openDailyCheckin(): Promise<void> {
        return HallActivityRouter.openDailyCheckin();
    }

    public openDailyWork(): Promise<void> {
        return HallActivityRouter.openDailyWork();
    }

    public openNewPlayerTask(): Promise<void> {
        return HallActivityRouter.openNewPlayerTask();
    }

    public openWeeklyMonthCard(): Promise<void> {
        return HallActivityRouter.openWeeklyMonthCard();
    }

    public openPiggyBank(): Promise<void> {
        return HallActivityRouter.openPiggyBank();
    }

    public openFirstBuy(): Promise<void> {
        return HallActivityRouter.openFirstBuy();
    }

    public openWholeDayGift(): Promise<void> {
        return HallActivityRouter.openWholeDayGift();
    }

    public openRebateRecharge(): Promise<void> {
        return HallActivityRouter.openRebateRecharge();
    }

    public openRestartGift(): Promise<void> {
        return HallActivityRouter.openRestartGift();
    }

    public openConsecutiveGift(): Promise<void> {
        return HallActivityRouter.openConsecutiveGift();
    }

    public openCouponPackage(ext?: unknown): Promise<void> {
        return HallActivityRouter.openCouponPackage(ext);
    }

    public openPayOneForThree(): Promise<void> {
        return HallActivityRouter.openPayOneForThree();
    }

    public openEarthquakes(chip: 0 | 1 = 0): Promise<void> {
        return HallActivityRouter.openEarthquakes(chip);
    }
}

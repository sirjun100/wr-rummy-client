import {
    _decorator,
    color,
    Label,
    Node,
    ScrollView,
    sp,
    Sprite,
    SpriteFrame,
    sys,
    tween,
    v3,
} from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { HallPlayerModel } from "../model/HallPlayerModel";
import { HallConfigModel } from "../model/HallConfigModel";
import { SettingsPreferenceModel } from "../model/SettingsPreferenceModel";
import { SessionModel } from "../../../../../script/game/model/SessionModel";
import { WalletModel } from "../../../../../script/game/model/WalletModel";
import { PaymentModel } from "../../../../../script/game/commerce/model/PaymentModel";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { AppBootstrapModel } from "../../../../../script/game/model/AppBootstrapModel";
import { BgmContext } from "../../../../../script/game/system/AudioSystem";
import { AudioKit } from "../../../../../script/framework/toolkits/audioKit/AudioKit";
import { Utility } from "../../../../../script/game/utility/Utility";
import { CarteActions } from "../config/CarteConfig";
import { routeCarteAction } from "../utility/CarteMenuRouter";
import { PropsTableRedDotChangedEvent } from "../../../../tableChrome/tableProps/script/event/PropsTableRedDotChangedEvent";
import { ensurePropsRegistered } from "../../../../tableChrome/tableProps/script/PropsManageModule";
import { PropsManageModel } from "../../../../tableChrome/tableProps/script/model/PropsManageModel";

const { ccclass, property } = _decorator;

@ccclass("Carte")
export class CarteNodeView extends BaseDialog {
    @property(sp.Skeleton)
    public head_img: sp.Skeleton = null;

    @property(Sprite)
    public head_club_kuang: Sprite = null;

    @property([SpriteFrame])
    public switch_imgs: SpriteFrame[] = [];

    @property([Node])
    public switchNodes: Node[] = [];

    @property(Label)
    public nameLabel: Label = null;

    @property(Label)
    public balance_numLabel: Label = null;

    @property(Label)
    public chip_numLabel: Label = null;

    @property(Label)
    public appVerLabel: Label = null;

    @property(Label)
    public useridLabel: Label = null;

    @property(ScrollView)
    public scrollview: ScrollView = null;

    @property([Node])
    public groupViews: Node[] = [];

    @property([Node])
    public tabViews: Node[] = [];

    @property([SpriteFrame])
    public club_headkuangs: SpriteFrame[] = [];

    private readonly groupArrowStatus: number[] = [1, 0, 0, 0, 0];
    private readonly groupColor = color(163, 0, 0);

    @property(Node)
    public tableRedDot: Node | null = null;

    protected OnInit(): void {
        this.bindModels();
        this.bindPropsRedDot();
        this.refreshStaticLabels();
        for (let i = 0; i < 5; i++) {
            this.updateGroupState(i);
        }
        this.refreshSwitchNodes();
        this.playOpenAnim();
    }

    protected OnClose(): void {}

    private bindPropsRedDot(): void {
        ensurePropsRegistered();
        const model = GameApp.Interface.GetModel(PropsManageModel);
        model.tableRedDot.RegisterWithInitValue((v) => this.applyTableRedDot(v), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        GameApp.Interface.RegisterEvent(PropsTableRedDotChangedEvent, (e) => this.applyTableRedDot(e.value), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private applyTableRedDot(value: number): void {
        if (this.tableRedDot) {
            this.tableRedDot.active = value > 0;
        }
    }

    private bindModels(): void {
        const wallet = GameApp.Interface.GetModel(WalletModel);
        wallet.snapshot.RegisterWithInitValue((w) => this.applyWallet(w), this).UnRegisterWhenGameObjectDestroyed(this.node);
        const player = GameApp.Interface.GetModel(HallPlayerModel);
        player.player.RegisterWithInitValue((p) => this.applyPlayer(p), this).UnRegisterWhenGameObjectDestroyed(this.node);
        const membership = GameApp.Interface.GetModel(PaymentModel);
        membership.membershipPage.RegisterWithInitValue(() => this.updateClubFrame(), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
    }

    private refreshStaticLabels(): void {
        const session = GameApp.Interface.GetModel(SessionModel);
        if (this.useridLabel) {
            this.useridLabel.string = `ID:${session.uid}`;
        }
        if (this.appVerLabel) {
            const ver = GameApp.Interface.GetModel(AppBootstrapModel).serverVer ?? "1.0";
            this.appVerLabel.string = `V${ver}`;
        }
    }

    private applyWallet(w: { balance?: number; deposit?: number; bonus?: number }): void {
        const total = w.balance ?? (w.deposit ?? 0) + (w.bonus ?? 0);
        if (this.balance_numLabel) {
            this.balance_numLabel.string = Utility.format.money(total);
        }
        if (this.chip_numLabel) {
            this.chip_numLabel.string = Utility.format.money(w.bonus ?? 0);
        }
    }

    private applyPlayer(p: { name?: string; challenger_open?: number }): void {
        if (this.nameLabel) {
            this.nameLabel.string = p.name?.length ? p.name : `Player${GameApp.Interface.GetModel(SessionModel).uid}`;
        }
        this.applyChallengerMenuVisibility(Number(p.challenger_open ?? 1) === 1);
    }

    private applyChallengerMenuVisibility(visible: boolean): void {
        const root = this.scrollview?.content ?? this.node;
        const walk = (n: Node): void => {
            for (const child of n.children) {
                if (child.name.includes("challenger") || child.name.includes("leaderboard")) {
                    child.active = visible;
                }
                walk(child);
            }
        };
        walk(root);
    }

    private updateClubFrame(): void {
        if (!this.head_club_kuang) {
            return;
        }
        const level = GameApp.Interface.GetModel(PaymentModel).membershipPage.value.level ?? 0;
        this.head_club_kuang.node.active = level > 0 && this.club_headkuangs.length > 0;
        if (this.head_club_kuang.node.active) {
            const idx = Math.min(level, this.club_headkuangs.length - 1);
            this.head_club_kuang.spriteFrame = this.club_headkuangs[idx];
        }
    }

    private refreshSwitchNodes(): void {
        if (this.switchNodes.length >= 2) {
            this.updateSwitchStatus(this.switchNodes[0], AudioKit.Settings.IsMusicOn.Value);
            this.updateSwitchStatus(this.switchNodes[1], AudioKit.Settings.IsSoundOn.Value);
        }
        const prefs = GameApp.Interface.GetModel(SettingsPreferenceModel);
        if (this.switchNodes.length >= 4) {
            this.updateSwitchStatus(this.switchNodes[2], prefs.getCardVoiceEnabled());
            this.updateSwitchStatus(this.switchNodes[3], prefs.getVibrationEnabled());
        }
        const chips = GameApp.Interface.GetModel(HallConfigModel).chipsModel;
        if (chips && this.scrollview?.content) {
            const walletRoot = this.scrollview.content.getChildByName("wallet_root");
            if (walletRoot) {
                walletRoot.active = false;
            }
        }
    }

    private updateSwitchStatus(node: Node, on: boolean): void {
        if (!node || !this.switch_imgs.length) {
            return;
        }
        const sp = node.getComponent(Sprite);
        if (sp) {
            sp.spriteFrame = on ? this.switch_imgs[1] : this.switch_imgs[0];
        }
    }

    private updateGroupState(index: number): void {
        const gv = this.groupViews[index];
        const tv = this.tabViews[index];
        if (!gv || !tv) {
            return;
        }
        const arrowIco = gv.getChildByName("arrow")?.getChildByName("ico");
        const spr = arrowIco?.getComponent(Sprite);
        if (this.groupArrowStatus[index] === 0) {
            if (spr) {
                spr.color = color(197, 197, 197);
            }
            if (arrowIco) {
                arrowIco.angle = -90;
            }
            tv.active = false;
        } else {
            if (spr) {
                spr.color = this.groupColor;
            }
            if (arrowIco) {
                arrowIco.angle = 90;
            }
            tv.active = true;
        }
    }

    private playOpenAnim(): void {
        const root = this.node.getChildByName("root");
        if (!root) {
            return;
        }
        root.setPosition(v3(545, 0, 0));
        tween(root).to(0.15, { position: v3(0, 0, 0) }).start();
    }

    public hideAnim(): void {
        const root = this.node.getChildByName("root");
        if (!root) {
            this.CloseSelf();
            return;
        }
        const start = root.position.clone();
        tween(root)
            .to(0.15, { position: v3(start.x + 540, start.y, 0) })
            .call(() => this.CloseSelf())
            .start();
    }

    public clickCallback(_event: unknown, customData: string): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        if (customData === CarteActions.HideMenu) {
            this.hideAnim();
            return;
        }
        if (customData?.indexOf("group_arrow") !== -1) {
            const idx = parseInt(customData.split("_arrow")[1], 10);
            if (!Number.isNaN(idx) && idx >= 0 && idx < this.groupArrowStatus.length) {
                this.groupArrowStatus[idx] = this.groupArrowStatus[idx] === 0 ? 1 : 0;
                this.updateGroupState(idx);
            }
            return;
        }
        if (customData === CarteActions.Music && this.switchNodes[0]) {
            const on = !AudioKit.Settings.IsMusicOn.Value;
            AudioKit.Settings.IsMusicOn.Value = on;
            sys.localStorage.setItem("bg_enabled", String(on));
            this.updateSwitchStatus(this.switchNodes[0], on);
            GameApp.Interface.GetSystem(AudioSystem).switchBgm(BgmContext.Hall);
            return;
        }
        if (customData === CarteActions.Sound && this.switchNodes[1]) {
            const on = !AudioKit.Settings.IsSoundOn.Value;
            AudioKit.Settings.IsSoundOn.Value = on;
            sys.localStorage.setItem("fx_enabled", String(on));
            this.updateSwitchStatus(this.switchNodes[1], on);
            return;
        }
        if (customData === CarteActions.Vibration && this.switchNodes[3]) {
            const prefs = GameApp.Interface.GetModel(SettingsPreferenceModel);
            const on = !prefs.getVibrationEnabled();
            prefs.setVibrationEnabled(on);
            this.updateSwitchStatus(this.switchNodes[3], on);
            return;
        }
        if (customData === CarteActions.CardVoice && this.switchNodes[2]) {
            const prefs = GameApp.Interface.GetModel(SettingsPreferenceModel);
            const on = !prefs.getCardVoiceEnabled();
            prefs.setCardVoiceEnabled(on);
            this.updateSwitchStatus(this.switchNodes[2], on);
            return;
        }
        void routeCarteAction(customData);
    }

    public onBackView(): void {
        this.hideAnim();
    }
}

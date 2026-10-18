import { _decorator, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { WalletModel } from "../../../../../script/game/model/WalletModel";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { FetchLedgerListCommand } from "../../../../../script/game/commerce/command/FetchLedgerListCommand";
import { FetchWalletSnapshotCommand } from "../../../../../script/game/commerce/command/FetchWalletSnapshotCommand";
import { FetchMembershipPageCommand } from "../../../../../script/game/commerce/command/FetchMembershipPageCommand";
import { FetchPaymentProfileCommand } from "../../../../../script/game/commerce/command/FetchPaymentProfileCommand";
import { PaymentModel } from "../../../../../script/game/commerce/model/PaymentModel";
import { PaymentUtility } from "../../../../../script/game/commerce/utility/PaymentUtility";
import { HallConfigModel } from "../../../../hall/hallMenu/script/model/HallConfigModel";
import { LedgerPreviewCount, PurseI18n } from "../config/PurseConfig";
import { bindLedgerRows } from "../controller/LedgerListBinder";
import { bindPurseProfile } from "../controller/PurseProfileBinder";
import {
    ensurePurseRegistered,
    openShopMain,
    openWithdrawalMain,
    openKycPhoto,
    openMembership,
    openPurseHistory,
    openWalletPayDetails,
    openPersonMsgBind,
} from "../PurseModule";
import { PaymentDialogBase } from "./PaymentDialogBase";

const { ccclass, property } = _decorator;

@ccclass("PurseDialog")
export class PurseDialog extends PaymentDialogBase {
    @property(Label)
    public totalBalanceLabel: Label = null;

    @property(Label)
    public deposited_text: Label = null;

    @property(Label)
    public winnings_text: Label = null;

    @property(Label)
    public bonus_text: Label = null;

    @property(Node)
    public recordScrollView: Node = null;

    private readonly util = new PaymentUtility();

    protected OnInit(): void {
        ensurePurseRegistered();
        GameApp.Interface.SendCommand(new FetchWalletSnapshotCommand());
        GameApp.Interface.SendCommand(new FetchLedgerListCommand());
        GameApp.Interface.SendCommand(new FetchMembershipPageCommand());
        GameApp.Interface.SendCommand(new FetchPaymentProfileCommand());
        const wallet = GameApp.Interface.GetModel(WalletModel);
        wallet.snapshot.RegisterWithInitValue((s) => this.applySnapshot(s), this).UnRegisterWhenGameObjectDestroyed(this.node);
        const payment = GameApp.Interface.GetModel(PaymentModel);
        payment.profile.RegisterWithInitValue((p) => bindPurseProfile(this.node, p), this).UnRegisterWhenGameObjectDestroyed(this.node);
        payment.ledgerList.RegisterWithInitValue((list) => this.previewLedger(list), this).UnRegisterWhenGameObjectDestroyed(this.node);
        payment.membershipPage.RegisterWithInitValue((m) => {
            this.setLabelByName(this.node, "club_level", `Lv.${m.level ?? 0}`);
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("deposit_btn", () => this.onDeposit());
        this.wireByName("withdraw_btn", () => this.onWithdraw());
        this.wireByName("kyc_btn", () => void openKycPhoto());
        this.wireByName("history_btn", () => void openPurseHistory());
        this.wireByName("membership_btn", () => void openMembership());
        this.wireByName("btn_tel", () => void openPersonMsgBind("tel"));
        this.wireByName("btn_email", () => void openPersonMsgBind("email"));
        this.wireByName("help_btn", () => {
            void import("../../../shared/commonUi/script/PublicModule").then((m) => m.showHelp(PurseI18n.walletHelp));
        });
    }

    protected OnClose(): void {}

    private onDeposit(): void {
        const snap = GameApp.Interface.GetModel(WalletModel).snapshot.value;
        if (snap.shop_open === 0) {
            GameApp.Interface.GetSystem(UISystem).showToast(PurseI18n.shopClosed);
            return;
        }
        void openShopMain();
    }

    private onWithdraw(): void {
        const hall = GameApp.Interface.GetModel(HallConfigModel);
        if (hall.config.value.pingbi?.withdraw) {
            GameApp.Interface.GetSystem(UISystem).showToast(PurseI18n.withdrawBlocked);
            return;
        }
        void openWithdrawalMain();
    }

    private applySnapshot(s: WalletModel["snapshot"]["value"]): void {
        const total = (s.deposit ?? 0) + (s.winnings ?? 0) + (s.bonus ?? 0);
        if (this.totalBalanceLabel) {
            this.totalBalanceLabel.string = this.util.formatMoney(total);
        }
        if (this.deposited_text) {
            this.deposited_text.string = this.util.formatMoney(s.deposit);
        }
        if (this.winnings_text) {
            this.winnings_text.string = this.util.formatMoney(s.winnings);
        }
        if (this.bonus_text) {
            this.bonus_text.string = this.util.formatMoney(s.bonus);
        }
    }

    private previewLedger(list: PaymentModel["ledgerList"]["value"]): void {
        if (!this.recordScrollView) {
            return;
        }
        bindLedgerRows(
            this.recordScrollView,
            "recordMoban",
            list,
            LedgerPreviewCount,
            (id) => void openWalletPayDetails(id),
            this,
        );
    }
}

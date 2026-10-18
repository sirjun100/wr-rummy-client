import { GameApp } from "../../../../script/game/GameApp";
import { AudioFxId } from "../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../script/game/config/BundleManifest";
import { LoginSuccessEvent } from "../../../../script/game/event/LoginSuccessEvent";
import { FetchWalletSnapshotCommand } from "../../../../script/game/commerce/command/FetchWalletSnapshotCommand";
import {
    LedgerDetailOpenData,
    LedgerOpenData,
    ShopOpenData,
} from "../../../../script/game/commerce/config/PaymentProtocol";
import { PaymentDialogId } from "../../../../script/game/commerce/config/PaymentDialogId";
import { RegisterPaymentPushCommand } from "../../../../script/game/commerce/command/RegisterPaymentPushCommand";
import { PurseUiModel } from "./model/PurseUiModel";
import { AudioSystem } from "../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../script/game/system/UISystem";
import { UILevel } from "../../../../script/framework/toolkits/uiKit/UIKit";
import { PurseDialog } from "./ui/PurseDialog";
import { ShopMainDialog } from "./ui/ShopMainDialog";
import { PaymentSelectDialog, PaymentSelectData } from "./ui/PaymentSelectDialog";
import { ShopRetainDialog } from "./ui/ShopRetainDialog";
import { CouponPopDialog } from "./ui/CouponPopDialog";
import { PurseHistoryDialog } from "./ui/PurseHistoryDialog";
import { WalletPayDetailsView } from "./ui/WalletPayDetailsView";
import { WithdrawalMainDialog } from "./ui/WithdrawalMainDialog";
import { WithdrawalEditDialog } from "./ui/WithdrawalEditDialog";
import { WithdrawalDetailsDialog, WithdrawalDetailsData } from "./ui/WithdrawalDetailsDialog";
import { WithdrawalAccountListDialog } from "./ui/WithdrawalAccountListDialog";

let registered = false;

export function ensurePurseRegistered(): void {
    if (registered) {
        return;
    }
    registered = true;
    GameApp.Interface.RegisterModel(new PurseUiModel());
    GameApp.Interface.SendCommand(new RegisterPaymentPushCommand());
    GameApp.Interface.RegisterEvent(LoginSuccessEvent, () => {
        GameApp.Interface.SendCommand(new FetchWalletSnapshotCommand());
    });
}

/** @deprecated use ensurePurseRegistered */
export const ensurePaymentRegistered = ensurePurseRegistered;

async function openDialog<T>(panel: new () => T, prefab: string, uiData?: unknown): Promise<void> {
    ensurePurseRegistered();
    const audio = GameApp.Interface.GetSystem(AudioSystem);
    audio.playFx(AudioFxId.ActPopShow);
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(panel, BundleKey.Wallet, prefab, {
        uiData: uiData ?? {},
        level: UILevel.PopUI,
    });
}

export async function openPurseDialog(): Promise<void> {
    await openDialog(PurseDialog, PaymentDialogId.PurseDialog);
}

export async function openShopMain(data?: ShopOpenData): Promise<void> {
    await openDialog(ShopMainDialog, PaymentDialogId.ShopMain, data ?? new ShopOpenData());
}

export async function openPaymentSelect(
    skuId: number,
    channelId: number,
    scene: number,
    vid: number,
    fastBuy: boolean,
): Promise<void> {
    const payload: PaymentSelectData = { skuId, channelId, scene, vid, fastBuy };
    await openDialog(PaymentSelectDialog, PaymentDialogId.PaymentSelect, payload);
}

export async function openShopRetain(onLeave: () => void): Promise<void> {
    await openDialog(ShopRetainDialog, PaymentDialogId.ShopRetainDialog, onLeave);
}

export async function openCouponPop(): Promise<void> {
    await openDialog(CouponPopDialog, PaymentDialogId.CouponPopDialog);
}

export async function openPurseHistory(): Promise<void> {
    await openDialog(PurseHistoryDialog, PaymentDialogId.PurseHistoryDialog, new LedgerOpenData());
}

export async function openWalletPayDetails(ledgerId: number): Promise<void> {
    await openDialog(WalletPayDetailsView, PaymentDialogId.WalletPayDetailsView, new LedgerDetailOpenData(ledgerId));
}

export async function openWithdrawalMain(): Promise<void> {
    await openDialog(WithdrawalMainDialog, PaymentDialogId.WithdrawalMainDialog);
}

export async function openWithdrawalEdit(): Promise<void> {
    await openDialog(WithdrawalEditDialog, PaymentDialogId.WithdrawalEditDialog);
}

export async function openWithdrawalDetails(data: WithdrawalDetailsData): Promise<void> {
    await openDialog(WithdrawalDetailsDialog, PaymentDialogId.WithdrawalDetailsDialog, data);
}

export async function openWithdrawalAccountList(): Promise<void> {
    await openDialog(WithdrawalAccountListDialog, PaymentDialogId.WithdrawalAccountListDialog);
}

export async function openKycPhoto(): Promise<void> {
    const m = await import("../kyc/script/VerifyModule");
    await m.openKycPhoto();
}

export async function openMembership(): Promise<void> {
    const m = await import("../vipClub/script/MembershipModule");
    await m.openMembership();
}

export async function openMembershipUpgrade(inGame: boolean): Promise<void> {
    const m = await import("../vipClub/script/MembershipModule");
    await m.openMembershipUpgrade(inGame);
}

export async function openPersonMsgBind(bindType: "tel" | "email" = "tel"): Promise<void> {
    const m = await import("../kyc/script/VerifyModule");
    await m.openPersonMsgBind(bindType);
}

export async function openHallFastBuy(data?: import("../../../../script/game/commerce/config/PaymentProtocol").FastBuyOpenData): Promise<void> {
    const m = await import("../quickRecharge/script/FastBuyModule");
    await m.openHallFastBuy(data);
}

export async function openGameFastBuy(
    data?: import("../../../../script/game/commerce/config/PaymentProtocol").FastBuyOpenData,
): Promise<void> {
    const m = await import("../quickRecharge/script/FastBuyModule");
    await m.openGameFastBuy(data);
}

if (typeof globalThis !== "undefined") {
    const api = {
        openPurse: openPurseDialog,
        openShopMain,
        openHallFastBuy,
        openGameFastBuy,
        openWithdrawalMain,
        openPurseHistory,
        openCouponPop,
        openPaymentSelect,
        openPersonMsgBind,
        openKycPhoto,
        openMembership,
        ensureRegistered: ensurePurseRegistered,
    };
    const g = globalThis as { wrWallet?: Record<string, unknown>; wrPayment?: Record<string, unknown> };
    g.wrWallet = api;
    g.wrPayment = api;
}

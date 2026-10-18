import { GameApp } from "../../../../script/game/GameApp";
import { FastBuyOpenData } from "../../../../script/game/commerce/config/PaymentProtocol";
import { WalletModel } from "../../../../script/game/model/WalletModel";
import { LogKit } from "../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { ensurePurseRegistered } from "../wallet/script/PurseModule";
import { OpenFastBuyDialogCommand } from "./command/OpenFastBuyDialogCommand";

export type FastBuyFlowParams = {
    context?: "hall" | "game";
    vid?: number;
    inRoom?: number;
    checkKyc?: number;
    minEntry?: number;
    tidKey?: string;
    autoQuick?: number;
};

export function ensureFastBuyRegistered(): void {
    ensurePurseRegistered();
}

function canOpenShop(): boolean {
    const snap = GameApp.Interface.GetModel(WalletModel).snapshot.value;
    if (snap.shop_open === 0) {
        LogKit.W("[FastBuyModule] shop_open disabled");
        globalThis.wrUi?.showToast?.("Recharge unavailable");
        return false;
    }
    return true;
}

function toOpenData(params?: FastBuyFlowParams, context: "hall" | "game" = "hall"): FastBuyOpenData {
    const p = params ?? {};
    return new FastBuyOpenData(
        p.context ?? context,
        p.vid ?? 0,
        p.inRoom ?? (context === "game" ? 1 : 0),
        p.checkKyc ?? 0,
        p.minEntry,
        p.tidKey,
        p.autoQuick,
    );
}

export function openFastBuyFlow(params?: FastBuyFlowParams): void {
    ensureFastBuyRegistered();
    if (!canOpenShop()) {
        return;
    }
    const ctx = params?.context ?? "hall";
    GameApp.Interface.SendCommand(new OpenFastBuyDialogCommand(toOpenData(params, ctx)));
}

export async function openHallFastBuy(data?: FastBuyOpenData): Promise<void> {
    ensureFastBuyRegistered();
    if (!canOpenShop()) {
        return;
    }
    const open = data ?? new FastBuyOpenData("hall", 0, 0);
    GameApp.Interface.SendCommand(new OpenFastBuyDialogCommand(open));
}

export async function openGameFastBuy(data?: FastBuyOpenData): Promise<void> {
    ensureFastBuyRegistered();
    if (!canOpenShop()) {
        return;
    }
    const open = data ?? new FastBuyOpenData("game", 0, 1);
    GameApp.Interface.SendCommand(new OpenFastBuyDialogCommand(open));
}

if (typeof globalThis !== "undefined") {
    (globalThis as {
        wrFastBuy?: {
            openHall: typeof openHallFastBuy;
            openGame: typeof openGameFastBuy;
            openFlow: typeof openFastBuyFlow;
        };
    }).wrFastBuy = {
        openHall: openHallFastBuy,
        openGame: openGameFastBuy,
        openFlow: openFastBuyFlow,
    };

    (globalThis as Record<string, unknown>).wrQuickRecharge = (globalThis as Record<string, unknown>).wrFastBuy;
}

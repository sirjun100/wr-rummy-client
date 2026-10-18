import { GameApp } from "../../../../../script/game/GameApp";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { RummyGameLogic } from "./RummyGameLogic";
import { RummyMoneyLessEvent } from "./event/RummyEvents";
import { RummyModel } from "./model/RummyModel";
import { GameRummyDealsRecordDialog } from "./ui/dialogs/GameRummyDealsRecordDialog";
import { GameRummyPoolDialog } from "./ui/dialogs/GameRummyPoolDialog";
import { RummyGameOverDialog } from "./ui/dialogs/RummyGameOverDialog";

let registered = false;

export function ensureRummyRegistered(): void {
    if (registered) {
        return;
    }
    GameApp.Interface.RegisterModel(new RummyModel());
    RummyGameLogic.bindPush();
    registered = true;
    GameApp.Interface.RegisterEvent(
        RummyMoneyLessEvent,
        () => {
            const vid = GameApp.Interface.GetModel(RummyModel).vid;
            void Promise.all([
                import("../../../../function/commerce/quickRecharge/script/FastBuyModule"),
                import("../../../../../script/game/commerce/config/PaymentProtocol"),
            ]).then(([fastBuy, proto]) => {
                fastBuy.openGameFastBuy(new proto.FastBuyOpenData("game", vid, 1));
            });
        },
        GameApp.Interface,
    );
}

export function ensureRummyDialogScripts(
    prefabRoot: import("cc").Node,
    dialog: "over" | "pool" | "deals",
): void {
    if (dialog === "over" && !prefabRoot.getComponent(RummyGameOverDialog)) {
        prefabRoot.addComponent(RummyGameOverDialog);
    }
    if (dialog === "pool" && !prefabRoot.getComponent(GameRummyPoolDialog)) {
        prefabRoot.addComponent(GameRummyPoolDialog);
    }
    if (dialog === "deals" && !prefabRoot.getComponent(GameRummyDealsRecordDialog)) {
        prefabRoot.addComponent(GameRummyDealsRecordDialog);
    }
}

export async function openRummyDialog<T>(
    panel: new (...args: unknown[]) => T,
    prefabName: string,
): Promise<T | null> {
    ensureRummyRegistered();
    const ui = GameApp.Interface.GetSystem(UISystem);
    const dlg = await ui.openDialogAsync(panel as never, BundleKey.Rummy, prefabName, {
        level: UILevel.PopUI,
    });
    if (dlg?.node) {
        if (prefabName.includes("Pool")) {
            ensureRummyDialogScripts(dlg.node, "pool");
        } else if (prefabName.includes("Deals")) {
            ensureRummyDialogScripts(dlg.node, "deals");
        } else {
            ensureRummyDialogScripts(dlg.node, "over");
        }
    }
    return dlg as T | null;
}

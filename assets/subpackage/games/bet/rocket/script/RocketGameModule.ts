import { GameApp } from "../../../../../script/game/GameApp";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { RocketModel } from "./model/RocketModel";
import { RocketGameLogic } from "./RocketGameLogic";

let registered = false;

export function ensureRocketRegistered(): void {
    if (registered) {
        return;
    }
    GameApp.Interface.RegisterModel(new RocketModel());
    RocketGameLogic.bindPush();
    registered = true;
}

export function ensureRocketDialogScripts(prefabRoot: import("cc").Node, dialog: "autoplay" | "jp" | "noseat"): void {
    void import("./ui/dialogs/RocketAutoplayDialog")
        .then((m) => {
            if (dialog === "autoplay" && !prefabRoot.getComponent(m.RocketAutoplayDialog)) {
                prefabRoot.addComponent(m.RocketAutoplayDialog);
            }
        })
        .catch(() => undefined);
    void import("./ui/dialogs/RocketJpDialog")
        .then((m) => {
            if (dialog === "jp" && !prefabRoot.getComponent(m.RocketJpDialog)) {
                prefabRoot.addComponent(m.RocketJpDialog);
            }
        })
        .catch(() => undefined);
    void import("./ui/dialogs/RocketNoseatPlayersDialog")
        .then((m) => {
            if (dialog === "noseat" && !prefabRoot.getComponent(m.RocketNoseatPlayersDialog)) {
                prefabRoot.addComponent(m.RocketNoseatPlayersDialog);
            }
        })
        .catch(() => undefined);
}

export async function openRocketDialog<T>(
    panel: new (...args: unknown[]) => T,
    prefabName: string,
): Promise<T | null> {
    ensureRocketRegistered();
    const ui = GameApp.Interface.GetSystem(UISystem);
    return ui.openDialogAsync(panel as never, BundleKey.Rocket, prefabName, {
        level: UILevel.PopUI,
    }) as Promise<T | null>;
}

import { Node } from "cc";
import { GameApp } from "../../../../script/game/GameApp";
import { SubGameId } from "../../../../script/game/config/BundleManifest";
import { BundleSystem } from "../../../../script/game/system/BundleSystem";
import { OpenGameRegularCommand } from "./command/OpenGameRegularCommand";
import { OpenHallRegularCommand } from "./command/OpenHallRegularCommand";
import type { GameRegularOpenData, HallRegularOpenData } from "./config/RegularProtocol";
import { resolveGameHelpKey, resolveRuleTabFromTemplate } from "./config/RegularConfig";
import { RegularUiModel } from "./model/RegularUiModel";
import { AppBootstrapModel } from "../../../../script/game/model/AppBootstrapModel";

let registered = false;

export function ensureRegularRegistered(): void {
    if (registered) {
        return;
    }
    registered = true;
    GameApp.Interface.RegisterModel(new RegularUiModel());
}

export function openHallRegular(data?: HallRegularOpenData): void {
    ensureRegularRegistered();
    GameApp.Interface.SendCommand(new OpenHallRegularCommand(data ?? {}));
}

export function openInGameRegular(data: GameRegularOpenData): void {
    ensureRegularRegistered();
    GameApp.Interface.SendCommand(new OpenGameRegularCommand(data));
}

export function openInGameHelpForSubGame(subGameId: SubGameId, landscape = true): void {
    openInGameRegular({ gameType: subGameId, landscape });
}

export function openRummyInGameRules(options: {
    templateId?: string;
    format?: string;
    tidKey?: string;
    isEasy?: boolean;
    isMultiple?: boolean;
    isBump?: boolean;
}): void {
    const ruleFlag = resolveRuleTabFromTemplate(options.templateId ?? "", options.format);
    openHallRegular({
        ruleFlag,
        isLandscape: true,
        tidKey: options.tidKey,
        isEasy: options.isEasy,
        isMultiple: options.isMultiple,
        isBump: options.isBump,
    });
}

export async function preloadRegularBundle(): Promise<void> {
    await GameApp.Interface.GetSystem(BundleSystem).loadBundle("regular");
}

/** @deprecated Prefer wrRegular.openHall / openInGame */
export async function attachRegularNode(_parent: Node, inGame: boolean): Promise<Node | null> {
    if (inGame) {
        openInGameRegular({ gameType: SubGameId.Rummy, landscape: true });
    } else {
        openHallRegular();
    }
    return null;
}

export function getGameHelpText(subGameId: SubGameId): string {
    const key = resolveGameHelpKey(subGameId);
    if (!key) {
        return "";
    }
    return GameApp.Interface.GetModel(AppBootstrapModel).gameHelp[key]?.help_text ?? "";
}

if (typeof globalThis !== "undefined") {
    (globalThis as {
        wrRegular?: {
            openHall: typeof openHallRegular;
            openInGame: typeof openInGameRegular;
            openInGameHelp: typeof openInGameHelpForSubGame;
            openRummyInGame: typeof openRummyInGameRules;
            preload: typeof preloadRegularBundle;
            ensureRegistered: typeof ensureRegularRegistered;
            attach: typeof attachRegularNode;
        };
    }).wrRegular = {
        openHall: openHallRegular,
        openInGame: openInGameRegular,
        openInGameHelp: openInGameHelpForSubGame,
        openRummyInGame: openRummyInGameRules,
        preload: preloadRegularBundle,
        ensureRegistered: ensureRegularRegistered,
        attach: attachRegularNode,
    };

    (globalThis as Record<string, unknown>).wrGameRules = (globalThis as Record<string, unknown>).wrRegular;
}

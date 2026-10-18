import { SubGameId } from "../../../../../script/game/config/BundleManifest";
import { GameApp } from "../../../../../script/game/GameApp";
import type { DeskRoomContext } from "../../../../tableChrome/tableTheme/script/config/DeskConfig";

export async function buildTransitionDeskContext(subGameId: SubGameId): Promise<DeskRoomContext> {
    const base: DeskRoomContext = {
        scene: "transition",
        gameType: subGameId,
    };
    if (subGameId !== SubGameId.Rummy) {
        return base;
    }
    try {
        const sm = await import("../../../../games/poker/rummy/script/model/RummyModel");
        const model = GameApp.Interface.GetModel(sm.RummyModel);
        const templateId = String(model.templateId ?? "");
        return {
            ...base,
            specialMode: false,
            isMatchRoom: templateId.includes("match"),
        };
    } catch {
        return base;
    }
}

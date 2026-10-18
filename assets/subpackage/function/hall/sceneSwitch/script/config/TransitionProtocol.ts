import type { SubGameId } from "../../../../../script/game/config/BundleManifest";
import type { TransitionMode } from "./TransitionConfig";

export type TransitionIntent = {
    mode: TransitionMode;
    subGameId?: SubGameId;
    sceneNameOverride?: string | null;
    backToHallVid?: number;
    reason?: string;
};

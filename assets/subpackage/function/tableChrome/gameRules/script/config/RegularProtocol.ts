import type { RegularTabId } from "./RegularConfig";
import type { SpriteFrame } from "cc";
import { SubGameId } from "../../../../../script/game/config/BundleManifest";

export type HallRegularOpenData = {
    ruleFlag?: RegularTabId;
    isLandscape?: boolean;
    tidKey?: string;
    isEasy?: boolean;
    isMultiple?: boolean;
    isBump?: boolean;
};

export type GameRegularOpenData = {
    gameType?: SubGameId;
    landscape?: boolean;
    useText?: boolean;
    text?: string;
    spriteFrame?: SpriteFrame | null;
    helpImageUrl?: string;
};

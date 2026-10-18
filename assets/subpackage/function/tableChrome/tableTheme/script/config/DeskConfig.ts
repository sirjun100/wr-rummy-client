/** Legacy PHP: Player.PropsUser.page → 1021, useProp → 1022 */

export const DeskStorageKey = {
    DisplayStyles: "display_styles",
} as const;

export const DeskBundleName = "desk";

export const DeskAssetPath = {
    BigPicPrefix: "big_pic/",
    MatchDesk: "rummy_card_table_bg_07",
    MatchRoom: "rummy_game_bg_6",
} as const;

export const DeskStyleLimits = {
    tableMin: 1,
    tableMax: 7,
    faceMin: 1,
    faceMax: 3,
    backMin: 1,
    backMax: 5,
} as const;

export type DisplayStylesTuple = [number, number, number];

export const DefaultDisplayStyles: DisplayStylesTuple = [1, 1, 3];

export type DeskRoomContext = {
    scene: "hall" | "transition" | "rummy";
    /** SubGameId when scene is transition */
    gameType?: number;
    specialMode?: boolean;
    isMatchRoom?: boolean;
};

export type DeskSkinTargets = {
    roomBg: import("cc").Node;
    desk: import("cc").Node | null;
    tableBg: import("cc").SpriteFrame[];
    deskBg: import("cc").SpriteFrame[];
    fourDeskBgs: import("cc").SpriteFrame[];
    otherTableBg: import("cc").SpriteFrame[];
    otherDeskBg: import("cc").SpriteFrame[];
    context: DeskRoomContext;
};

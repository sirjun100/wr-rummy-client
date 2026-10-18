/** Payment scene ids aligned with shop / create-order. */
export const FastBuyScene = {
    Hall: 1,
    InGame: 2,
} as const;

export const FastBuyContext = {
    Hall: "hall",
    Game: "game",
} as const;

export const FastBuyNodeNames = {
    Root: "rootNode",
    TabPrefix: "tab",
    TabCount: 3,
    Content: "content",
    ItemPrefix: "item",
    OkBtn: "ok_btn",
} as const;

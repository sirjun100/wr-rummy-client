import { SubGameId } from "../../../../../script/game/config/BundleManifest";

export type RegularTabId = "point" | "pool" | "deal";

export const RegularBundleName = "regular";

export const RegularTexturePath = {
    points: "texture/rules/rule_points_rummy",
    pool: "texture/rules/rule_pool_rummy",
    pointsContent: "texture/rules/rule_points_content",
    pointsType: "texture/rules/rule_points_type",
    pointsDouble: "texture/rules/rule_points_double",
} as const;

/** Long-form Deals rules (legacy regular_node.showDealsRules). */
export const DealsRulesText =
    "GOAL\n\nArrange all 13 cards into valid sequences and sets. A valid declaration needs at least two sequences, including one pure sequence. The remaining cards must also form valid groups.\n\nDEAL FORMATS\n\n2 players: choose 2 or 3 deals.\n6 players: choose 3 or 6 deals.\nCheck Table Info for the number of deals, entry fee and prizes at your table. The entry fee is paid once for the match.\n\nPLAY\n\nOn your turn, draw one card from the closed deck or the open discard pile, then discard one card. Declare only when the remaining 13 cards form a valid hand. Other players submit their groups after a valid declaration.\n\nSCORING\n\nPlayers start with 80 chips per scheduled deal. The hand winner receives the chips lost by the other players. A losing hand is scored up to 80 points. A, K, Q and J count as 10; numbered cards count at face value; Jokers count as 0. Valid groups reduce the penalty only when the required sequences are present.\n\nThe winner of one hand is not necessarily the match winner. Match ranking uses the final chip totals. See the final scoreboard for prizes and any tie-break.\n\nDROP AND LEAVE\n\nVoluntary Drop is unavailable in 2-player Deals. In 6-player Deals, an early Drop costs 20 points; a middle Drop costs 40. Dropping a hand keeps you in the match. Leaving the match forfeits participation; it does not refund the entry fee.\n\nJOKERS AND GROUPS\n\nA pure sequence has at least three consecutive cards of the same suit without a substitute Joker. An impure sequence can use a Joker to replace a missing card. A set contains three or four cards of the same rank in different suits and may use Jokers.\n\nAces can be low (A-2-3) or high (Q-K-A), but K-A-2 is invalid. Printed Jokers and cards of the selected wild rank can substitute in valid groups.";

const SUB_GAME_HELP_KEY: Partial<Record<SubGameId, string>> = {
    [SubGameId.Rocket]: "rocket",
    [SubGameId.Sixpoint]: "sixpoint",
    [SubGameId.Cricket]: "cricket",
    [SubGameId.Fruit]: "fruit_slot",
    [SubGameId.Rummy]: "rummy",
};

export function resolveGameHelpKey(subGameId: SubGameId): string | null {
    return SUB_GAME_HELP_KEY[subGameId] ?? null;
}

export function resolveRuleTabFromTemplate(templateId: string, format?: string): RegularTabId {
    const hay = `${templateId ?? ""} ${format ?? ""}`.toLowerCase();
    if (hay.includes("deal")) {
        return "deal";
    }
    if (hay.includes("pool")) {
        return "pool";
    }
    return "point";
}

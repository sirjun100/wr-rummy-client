import { SubGameId } from "./BundleManifest";

/** 旧 HallGameType 整型（CommDefine）→ 新 SubGameId；未映射返回 null。 */
const LEGACY_HALL_GAME_TO_SUB_GAME: Record<number, SubGameId> = {
    1: SubGameId.Rummy,
    3: SubGameId.Fruit,
    6: SubGameId.Cricket,
    7: SubGameId.Rocket,
    9: SubGameId.Sixpoint,
    15: SubGameId.Cricket,
    16: SubGameId.LuckyBall,
};

export function tryResolveSubGameIdFromLegacyHallType(legacyHallGameType: number): SubGameId | null {
    return LEGACY_HALL_GAME_TO_SUB_GAME[legacyHallGameType] ?? null;
}

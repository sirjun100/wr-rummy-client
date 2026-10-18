const DEFAULT_GRADE_MAP: Record<number, number> = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 1,
    15: 2,
    18: 3,
    20: 4,
    25: 5,
    30: 6,
    40: 7,
    50: 8,
    60: 9,
};

export function gradeByClubLevel(clubLevel: number): number {
    const lv = Number.isFinite(clubLevel) ? Math.floor(clubLevel) : 0;
    if (DEFAULT_GRADE_MAP[lv] !== undefined) {
        return DEFAULT_GRADE_MAP[lv];
    }
    return DEFAULT_GRADE_MAP[0] ?? 0;
}

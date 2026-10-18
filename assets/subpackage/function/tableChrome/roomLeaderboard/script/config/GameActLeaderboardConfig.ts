export const ChallengerRoute = {
    RoomPage: 1342,
    OptEntry: 1343,
    RoomProgress: 1344,
    NewPlayerRoomPage: 1345,
    ProgressPush: 1346,
} as const;

export type RankTabType = "hour" | "daily" | "cycle";

export const RankTabIndex: Record<number, RankTabType> = {
    0: "hour",
    1: "daily",
    2: "cycle",
};

export const GameActLeaderboardPrefab = "game_act_leaderboard";

export const RankingsRoute = {
    HallMain: 1347,
    HallRankDetail: 1348,
    HallRankBoardList: 1349,
    HallSchedule: 1350,
    HallAutoEntry: 1351,
    HallRewardPopAck: 1352,
} as const;

export type HallRankTabType = "daily" | "cycle";

export const HallRankTabIndex: Record<number, HallRankTabType> = {
    0: "daily",
    1: "cycle",
};

export const RankingsBoardOrigin = {
    Embedded: 1,
    Dialog: 2,
} as const;

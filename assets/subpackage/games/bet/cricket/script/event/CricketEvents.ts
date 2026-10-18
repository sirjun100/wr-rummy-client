export class CricketEnterReadyEvent {}
export class CricketListRefreshEvent {}
export class CricketSignSuccessEvent {
    public constructor(public readonly matchId: number, public readonly contestId: number) {}
}
export class CricketMoneyLessEvent {}
export class CricketCloseCreateTeamFlowEvent {}

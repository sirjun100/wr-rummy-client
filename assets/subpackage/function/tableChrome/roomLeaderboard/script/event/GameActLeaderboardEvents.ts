export class CloseRoomChallengerEvent {}

export class RoomChallengerProgressEvent {
    public constructor(public readonly list: import("../config/GameActLeaderboardProtocol").ProgressItemDto[]) {}
}

export class RoomChallengerVisibilityEvent {
    public constructor(
        public readonly show: boolean,
        public readonly totalReward: string,
        public readonly vid: number,
    ) {}
}

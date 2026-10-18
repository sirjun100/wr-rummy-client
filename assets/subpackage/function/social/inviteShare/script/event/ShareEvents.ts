export class ShareRefreshEvent {}

export class InviteRewardFlagEvent {
    public constructor(public readonly hasReward: boolean) {}
}

export class CloseInviteEvent {}

export class OpenInviteTabEvent {}

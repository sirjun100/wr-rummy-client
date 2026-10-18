export const LobbyTopViewRoute = {
    InboxList: 1026,
    InboxRead: 1027,
    InboxDelete: 1028,
    InboxClaim: 1029,
    AnnounceNext: 1030,
} as const;

export const TournamentRoute = {
    List: 4001,
    Signup: 4002,
    Detail: 4003,
} as const;

export const LobbyTopViewPrefab = {
    ActivityCenter: "ActivityCenterDialog",
    EmailMain: "EmailMainDialog",
    InboxDetail: "InboxDetailView",
    Announcement: "AnnouncementDialog",
    UpdateGuide: "UpdateGuideDialog",
    MatchDetails: "MatchDetailsDialog",
    RedemptionCode: "RedemptionCodeDialog",
} as const;

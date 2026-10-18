export const NetworkDelayDefaults = {
    heartOpen: 1,
    heartTimeWarn: 5,
    heartTimeDisconnect: 15,
    gamesDelayOpen: 1,
    signalDelayShow: 0,
} as const;

export const NetworkDelayI18n = {
    disconnectTitle: "Tips",
    disconnectContent: "Network connection timed out. Please try again.",
} as const;

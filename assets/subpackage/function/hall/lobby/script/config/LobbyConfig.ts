export const LobbyRoute = {
    HallHome: 1025,
} as const;

/** Legacy hall act_id parity (MainLobby / Hall.get). */
export const HallActId = {
    FirstBuy: 54,
    WeeklyMonthCard: 104,
    NewPlayerTask: 106,
    DailyCheckin: 107,
    RebateRecharge: 118,
    WholeDayGift: 119,
    BeginnerFlip: 123,
    RestartGift: 124,
    PayOneForThree: 125,
    ConsecutiveGift: 130,
    Cricket: 131,
    CouponPackage: 140,
    Rocket: 144,
    Sixpoint: 146,
    AdvancedGift: 74,
    PiggyBank: 68,
    DailyWork: 86,
    Earthquakes: 90,
    EarthquakesChip: 97,
} as const;

export const LobbyTabIndex = {
    Menu: 4,
    Invite: 3,
    GameEntry: 2,
    MiniGame: 1,
} as const;

/** Layout node name for hall list buttons keyed by act_id. */
export const HALL_ACT_BUTTON_NODES: Record<number, string> = {
    [HallActId.Sixpoint]: "sixdice_btn",
    [HallActId.Rocket]: "crash_btn",
    [HallActId.Cricket]: "yes11_btn",
};

export const HALL_HOME_FETCH_DEBOUNCE_MS = 1000;

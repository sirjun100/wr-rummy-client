/** Auto-aligned with assets/subpackage; dialogs from prefab/*.Dialog.prefab */

export enum BundleKind {
    Function = "function",
    Activity = "activity",
    SubGame = "subgame",
}

/** Every Asset Bundle (folder name → bundleName). */
export enum BundleKey {
    AdvancedGift = "AdvancedGift",
    BeginnerFlipTask = "BeginnerFlipTask",
    Common = "Common",
    Cricket = "Cricket",
    DailyCheckin = "DailyCheckin",
    DailyWork = "DailyWork",
    Earthquakes = "Earthquakes",
    Fruit = "Fruit",
    Lobby = "Lobby",
    LuckyBall = "LuckyBall",
    NewPlayerTask = "NewPlayerTask",
    PayOneForThree = "PayOneForThree",
    PiggyBank = "PiggyBank",
    RechargeEvent = "RechargeEvent",
    Rocket = "Rocket",
    Rummy = "Rummy",
    Sixpoint = "Sixpoint",
    Social = "Social",
    Sound = "Sound",
    User = "User",
    WeeklyMonthCard = "WeeklyMonthCard",
}

/** Playable sub-games only (enterGame / GameplayContext). */
export enum SubGameId {
    None = 0,
    Cricket = 1,
    Fruit = 2,
    LuckyBall = 3,
    Rocket = 4,
    Rummy = 5,
    Sixpoint = 6,
}

const SUB_GAME_ID_TO_BUNDLE_KEY: Record<Exclude<SubGameId, SubGameId.None>, BundleKey> = {
    [SubGameId.Cricket]: BundleKey.Cricket,
    [SubGameId.Fruit]: BundleKey.Fruit,
    [SubGameId.LuckyBall]: BundleKey.LuckyBall,
    [SubGameId.Rocket]: BundleKey.Rocket,
    [SubGameId.Rummy]: BundleKey.Rummy,
    [SubGameId.Sixpoint]: BundleKey.Sixpoint,
};

const BUNDLE_KEY_TO_SUB_GAME_ID = new Map<BundleKey, SubGameId>();
(
    Object.entries(SUB_GAME_ID_TO_BUNDLE_KEY) as [string, BundleKey][]
).forEach(([subGameIdStr, bundleKey]) => {
    BUNDLE_KEY_TO_SUB_GAME_ID.set(bundleKey, Number(subGameIdStr) as SubGameId);
});

export type BundleManifestEntry = {
    bundleKey: BundleKey;
    bundleName: string;
    kind: BundleKind;
    sceneName: string | null;
    sceneNames: string[];
    dialogs: string[];
    subGameId?: SubGameId;
};

export const BUNDLE_MANIFEST: BundleManifestEntry[] = [
    {
        bundleKey: BundleKey.AdvancedGift,
        bundleName: "advancedGift",
        kind: BundleKind.Activity,
        sceneName: null,
        sceneNames: [],
        dialogs: ["AdvancedGiftDialog"],
    },
    {
        bundleKey: BundleKey.BeginnerFlipTask,
        bundleName: "beginnerFlipTask",
        kind: BundleKind.Activity,
        sceneName: null,
        sceneNames: [],
        dialogs: ["BeginnerFlipRecordDialog", "BeginnerFlipTaskDialog", "BeginnerFlipTaskGameDialog"],
    },
    {
        bundleKey: BundleKey.Common,
        bundleName: "common",
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: ["AgeVerificationDialog", "BuddyRoomJoinDialog", "CommonDialogDialog", "ContactUsDialog", "FeedbackDialog", "GameSettingDialog", "HelpAlertDialog", "MatchAlertDialog", "MatchPrizesRankDialog", "MatchRankDialog", "MenuAlertDialog", "RewardTipsDialog", "SafeVerifyDialog"],
    },
    {
        bundleKey: BundleKey.Cricket,
        bundleName: "cricket",
        kind: BundleKind.SubGame,
        sceneName: null,
        sceneNames: [],
        dialogs: ["CricketAssureJoinDialog", "CricketEndPlayerDetailDialog", "CricketEndRewardDialog", "CricketGameSortDialog", "CricketGameTipDialog", "CricketGuaranteedPlusDialog", "CricketJoinListDialog", "CricketNotLineupDialog", "CricketShareBackDialog", "CricketSwitchListDialog"],
        subGameId: SubGameId.Cricket,
    },
    {
        bundleKey: BundleKey.DailyCheckin,
        bundleName: "dailycheckin",
        kind: BundleKind.Activity,
        sceneName: null,
        sceneNames: [],
        dialogs: ["DailyCheckinDialog"],
    },
    {
        bundleKey: BundleKey.DailyWork,
        bundleName: "dailyWork",
        kind: BundleKind.Activity,
        sceneName: null,
        sceneNames: [],
        dialogs: ["WelcomeBackWorkDialog"],
    },
    {
        bundleKey: BundleKey.Earthquakes,
        bundleName: "earthquakes",
        kind: BundleKind.Activity,
        sceneName: null,
        sceneNames: [],
        dialogs: ["EarthquakesDialog", "EarthquakesGameDialog"],
    },
    {
        bundleKey: BundleKey.Fruit,
        bundleName: "fruit",
        kind: BundleKind.SubGame,
        sceneName: "FruitSlotGame",
        sceneNames: ["FruitSlotGame"],
        dialogs: ["FruitSlotJpDialog"],
        subGameId: SubGameId.Fruit,
    },
    {
        bundleKey: BundleKey.Lobby,
        bundleName: "lobby",
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: ["Lobby", "Lobby2", "Transition"],
        dialogs: ["ActivityCenterDialog", "AddRoomDialog", "AnnouncementDialog", "DoubleRummyTypeDialog", "EmailMainDialog", "FilterMatchDialog", "GameAlreadyJoinedDialog", "LobbyLogoutDialog", "MatchDetailsDialog", "RedemptionCodeDialog", "UpdateGuideDialog"],
    },
    {
        bundleKey: BundleKey.LuckyBall,
        bundleName: "luckyBall",
        kind: BundleKind.SubGame,
        sceneName: null,
        sceneNames: [],
        dialogs: ["LuckyBallAnteDialog", "LuckyBallAnteWinDialog", "LuckyBallExplainDialog"],
        subGameId: SubGameId.LuckyBall,
    },
    {
        bundleKey: BundleKey.NewPlayerTask,
        bundleName: "newPlayerTask",
        kind: BundleKind.Activity,
        sceneName: null,
        sceneNames: [],
        dialogs: ["NewPlayerTaskDialog"],
    },
    {
        bundleKey: BundleKey.PayOneForThree,
        bundleName: "payoneforthree",
        kind: BundleKind.Activity,
        sceneName: null,
        sceneNames: [],
        dialogs: ["PayOneForThreeDialog", "PayOneForThreeGameDialog"],
    },
    {
        bundleKey: BundleKey.PiggyBank,
        bundleName: "piggy_bank",
        kind: BundleKind.Activity,
        sceneName: null,
        sceneNames: [],
        dialogs: ["PiggyBankDialog"],
    },
    {
        bundleKey: BundleKey.RechargeEvent,
        bundleName: "rechargeEvent",
        kind: BundleKind.Activity,
        sceneName: null,
        sceneNames: [],
        dialogs: ["CouponPackageDialog", "CouponPackageGameDialog", "EndlessBenefitsGiftDialog", "EndlessBenefitsGiftGameDialog", "FirstBuyDialog", "FirstBuyGameDialog", "FirstBuyOldDialog", "SuperValueGiftDialog", "SuperValueGiftGameDialog", "WholeDayGiftDialog"],
    },
    {
        bundleKey: BundleKey.Rocket,
        bundleName: "rocket",
        kind: BundleKind.SubGame,
        sceneName: "RocketGame",
        sceneNames: ["RocketGame"],
        dialogs: ["RocketAutoplayDialog", "RocketJpDialog", "RocketNoseatPlayersDialog"],
        subGameId: SubGameId.Rocket,
    },
    {
        bundleKey: BundleKey.Rummy,
        bundleName: "rummy",
        kind: BundleKind.SubGame,
        sceneName: "RummyGame",
        sceneNames: ["RummyGame"],
        dialogs: ["ChatAlertDialog", "CommMagicFaceDialog", "GameActLeaderboardDialog", "GameRegularDialog", "GameRummyDealsRecordDialog", "GameRummyPoolDialog", "GameRummyPoolManualDialog", "GameRummyPoolScoreboardDialog", "GameRummySwitchNoticeDialog", "MatchGameRebuyDialog", "MatchPointsOverDialog", "NewPlayerGuideDialog", "RecodeDetailsDialog", "RegularNodeDialog", "RoomInfoDialog", "RoomPerformanceDialog", "RummyBumpSwitchDialog", "RummyGameOverDialog", "SecurityFeaturesDialog"],
        subGameId: SubGameId.Rummy,
    },
    {
        bundleKey: BundleKey.Sixpoint,
        bundleName: "sixpoint",
        kind: BundleKind.SubGame,
        sceneName: "SixpointGame",
        sceneNames: ["SixpointGame"],
        dialogs: ["SixpointNoseatPlayersDialog", "SixpointNoseatRecodeDialog"],
        subGameId: SubGameId.Sixpoint,
    },
    {
        bundleKey: BundleKey.Social,
        bundleName: "social",
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: ["PropsManageDialog", "RankingsDialog", "RankingsEndTipDialog", "RankingsPopActDialog", "ShareMainPageDialog", "SharePopActDialog"],
    },
    {
        bundleKey: BundleKey.Sound,
        bundleName: "sound",
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: [],
    },
    {
        bundleKey: BundleKey.User,
        bundleName: "user",
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: ["CouponPopDialog", "GameFastBuyDialog", "HallFastBuyDialog", "MembershipUpgradeDialog", "MembershipUpgradeGameDialog", "PersonMsgBindDialog", "PurseDialog", "PurseHistoryDialog", "ShopRetainDialog", "WithdrawalAccountListDialog", "WithdrawalDetailsDialog", "WithdrawalEditDialog", "WithdrawalMainDialog"],
    },
    {
        bundleKey: BundleKey.WeeklyMonthCard,
        bundleName: "weeklymonthcard",
        kind: BundleKind.Activity,
        sceneName: null,
        sceneNames: [],
        dialogs: ["WeeklyMonthCardNewDialog"],
    },
];

const BUNDLE_KEY_TO_ENTRY = new Map<BundleKey, BundleManifestEntry>();
const BUNDLE_NAME_TO_ENTRY = new Map<string, BundleManifestEntry>();
for (const entry of BUNDLE_MANIFEST) {
    BUNDLE_KEY_TO_ENTRY.set(entry.bundleKey, entry);
    BUNDLE_NAME_TO_ENTRY.set(entry.bundleName, entry);
}

export function getManifestEntry(bundleKey: BundleKey): BundleManifestEntry | null {
    return BUNDLE_KEY_TO_ENTRY.get(bundleKey) ?? null;
}

export function getManifestEntryByBundleName(bundleName: string): BundleManifestEntry | null {
    return BUNDLE_NAME_TO_ENTRY.get(bundleName) ?? null;
}

export function resolveBundleKey(subGameId: SubGameId): BundleKey {
    if (subGameId === SubGameId.None) {
        throw new Error("resolveBundleKey: SubGameId.None");
    }
    const key = SUB_GAME_ID_TO_BUNDLE_KEY[subGameId as Exclude<SubGameId, SubGameId.None>];
    if (!key) {
        throw new Error(`resolveBundleKey: unknown SubGameId ${subGameId}`);
    }
    return key;
}

export function tryGetSubGameId(bundleKey: BundleKey): SubGameId | null {
    return BUNDLE_KEY_TO_SUB_GAME_ID.get(bundleKey) ?? null;
}

export const MAIN_SCENE_NAME = "Main";
export const DEFAULT_LOBBY_SCENE_NAME = "Lobby";
export const LOBBY_BUNDLE_KEY = BundleKey.Lobby;

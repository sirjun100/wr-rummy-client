/** Auto-aligned with assets/subpackage; dialogs from prefab/*.Dialog.prefab */

export enum BundleKind {
    Function = "function",
    Activity = "activity",
    SubGame = "subgame",
}

/** Every Asset Bundle (leaf folder name → `bundleName` for loadBundle / hot-update). */
export enum BundleKey {
    AdvancedGift = "AdvancedGift",
    Audio = "Audio",
    BeginnerFlipTask = "BeginnerFlipTask",
    CommonUi = "CommonUi",
    Cricket = "Cricket",
    DailyCheckin = "DailyCheckin",
    DailyWork = "DailyWork",
    Earthquakes = "Earthquakes",
    Fruit = "Fruit",
    GameRules = "GameRules",
    HallHeader = "HallHeader",
    HallLeaderboard = "HallLeaderboard",
    HallMenu = "HallMenu",
    InviteShare = "InviteShare",
    Kyc = "Kyc",
    Lobby = "Lobby",
    LuckyBall = "LuckyBall",
    NetworkOverlay = "NetworkOverlay",
    NewPlayerTask = "NewPlayerTask",
    PayOneForThree = "PayOneForThree",
    PiggyBank = "PiggyBank",
    QuickRecharge = "QuickRecharge",
    RechargeEvent = "RechargeEvent",
    Rocket = "Rocket",
    RoomLeaderboard = "RoomLeaderboard",
    RoomSelect = "RoomSelect",
    Rummy = "Rummy",
    SceneSwitch = "SceneSwitch",
    Sixpoint = "Sixpoint",
    TableProps = "TableProps",
    TableTheme = "TableTheme",
    VipClub = "VipClub",
    Wallet = "Wallet",
    WeeklyMonthCard = "WeeklyMonthCard",
}

export type FunctionBundleCategory = "hall" | "commerce" | "social" | "tableChrome" | "shared";

/** Hot-update / legacy Cocos bundle names → current leaf `bundleName`. */
export const LEGACY_BUNDLE_NAME_TO_CURRENT: Record<string, string> = {
    carte: "hallMenu",
    comm_share: "inviteShare",
    desk: "tableTheme",
    fast_buy: "quickRecharge",
    game_act_leaderboard: "roomLeaderboard",
    lobbyTopView: "hallHeader",
    membership: "vipClub",
    networkdelay: "networkOverlay",
    props_manage: "tableProps",
    public: "commonUi",
    purse: "wallet",
    rankings: "hallLeaderboard",
    regular: "gameRules",
    selectionVenue: "roomSelect",
    sound: "audio",
    transition: "sceneSwitch",
    verify: "kyc",
};

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
    /** Leaf Asset Bundle name (loadBundle / CDN). */
    bundleName: string;
    /** Path under `assets/subpackage/function/` (category/leaf). */
    bundleSubPath?: string;
    category?: FunctionBundleCategory;
    /** Previous `bundleName` values for one-release hot-update compatibility. */
    legacyBundleNames?: string[];
    kind: BundleKind;
    sceneName: string | null;
    sceneNames: string[];
    dialogs: string[];
    subGameId?: SubGameId;
};

const FUNCTION_BUNDLE_ROOT = "subpackage/function";

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
        bundleKey: BundleKey.CommonUi,
        bundleName: "commonUi",
        bundleSubPath: "shared/commonUi",
        category: "shared",
        legacyBundleNames: ["public"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: [
            "AgeVerificationDialog",
            "BuddyRoomJoinDialog",
            "CommonDialogDialog",
            "ContactUsDialog",
            "FaqNode",
            "FeedbackDialog",
            "GameSettingDialog",
            "HelpAlertDialog",
            "MatchAlertDialog",
            "MatchPrizesRankDialog",
            "MatchRankDialog",
            "MenuAlertDialog",
            "RewardTipsDialog",
            "SafeVerifyDialog",
            "SelectArea",
            "SelectDate",
        ],
    },
    {
        bundleKey: BundleKey.NetworkOverlay,
        bundleName: "networkOverlay",
        bundleSubPath: "tableChrome/networkOverlay",
        category: "tableChrome",
        legacyBundleNames: ["networkdelay"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: ["NetworkDelay"],
    },
    {
        bundleKey: BundleKey.Cricket,
        bundleName: "cricket",
        kind: BundleKind.SubGame,
        sceneName: "Cricket",
        sceneNames: ["Cricket"],
        dialogs: [
            "CricketAssureJoinDialog",
            "CricketEndPlayerDetailDialog",
            "CricketEndRewardDialog",
            "CricketGameDetails",
            "CricketGameSortDialog",
            "CricketGameTipDialog",
            "CricketGuaranteedPlusDialog",
            "CricketJoinListDialog",
            "CricketNotLineupDialog",
            "CricketShareBackDialog",
            "CricketSwitchListDialog",
        ],
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
        bundleSubPath: "hall/lobby",
        category: "hall",
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: ["Lobby", "Lobby2"],
        dialogs: [
            "AddRoomDialog",
            "DoubleRummyTypeDialog",
            "FilterMatchDialog",
            "GameAlreadyJoinedDialog",
            "LobbyAd",
            "LobbyLogoutDialog",
        ],
    },
    {
        bundleKey: BundleKey.HallHeader,
        bundleName: "hallHeader",
        bundleSubPath: "hall/hallHeader",
        category: "hall",
        legacyBundleNames: ["lobbyTopView"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: [
            "ActivityCenterDialog",
            "AnnouncementDialog",
            "EmailMainDialog",
            "InboxDetailView",
            "MatchDetailsDialog",
            "RedemptionCodeDialog",
            "UpdateGuideDialog",
        ],
    },
    {
        bundleKey: BundleKey.SceneSwitch,
        bundleName: "sceneSwitch",
        bundleSubPath: "hall/sceneSwitch",
        category: "hall",
        legacyBundleNames: ["transition"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: ["Transition"],
        dialogs: [],
    },
    {
        bundleKey: BundleKey.RoomSelect,
        bundleName: "roomSelect",
        bundleSubPath: "hall/roomSelect",
        category: "hall",
        legacyBundleNames: ["selectionVenue"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: ["RummySelection"],
    },
    {
        bundleKey: BundleKey.HallMenu,
        bundleName: "hallMenu",
        bundleSubPath: "hall/hallMenu",
        category: "hall",
        legacyBundleNames: ["carte"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: ["CarteNode"],
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
        dialogs: [
            "CouponPackageDialog",
            "CouponPackageGameDialog",
            "EndlessBenefitsGiftDialog",
            "EndlessBenefitsGiftGameDialog",
            "FirstBuyDialog",
            "FirstBuyGameDialog",
            "FirstBuyOldDialog",
            "RebateRechargeDialog",
            "RebateRechargeGameDialog",
            "SuperValueGiftDialog",
            "SuperValueGiftGameDialog",
            "WholeDayGiftDialog",
        ],
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
        bundleKey: BundleKey.Wallet,
        bundleName: "wallet",
        bundleSubPath: "commerce/wallet",
        category: "commerce",
        legacyBundleNames: ["purse"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: [
            "CouponPopDialog",
            "LetterKeyboard",
            "PaymentSelect",
            "PurseDialog",
            "PurseHistoryDialog",
            "ShopMain",
            "ShopRetainDialog",
            "WalletPayDetailsView",
            "WithdrawalAccountListDialog",
            "WithdrawalDetailsDialog",
            "WithdrawalEditDialog",
            "WithdrawalMainDialog",
        ],
    },
    {
        bundleKey: BundleKey.QuickRecharge,
        bundleName: "quickRecharge",
        bundleSubPath: "commerce/quickRecharge",
        category: "commerce",
        legacyBundleNames: ["fast_buy"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: ["GameFastBuyDialog", "HallFastBuyDialog"],
    },
    {
        bundleKey: BundleKey.VipClub,
        bundleName: "vipClub",
        bundleSubPath: "commerce/vipClub",
        category: "commerce",
        legacyBundleNames: ["membership"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: ["Membership", "MembershipUpgradeDialog", "MembershipUpgradeGameDialog"],
    },
    {
        bundleKey: BundleKey.Kyc,
        bundleName: "kyc",
        bundleSubPath: "commerce/kyc",
        category: "commerce",
        legacyBundleNames: ["verify"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: ["KycPhoto", "PersonMsgBindDialog"],
    },
    {
        bundleKey: BundleKey.InviteShare,
        bundleName: "inviteShare",
        bundleSubPath: "social/inviteShare",
        category: "social",
        legacyBundleNames: ["comm_share"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: ["ShareMainPageDialog", "SharePopActDialog"],
    },
    {
        bundleKey: BundleKey.HallLeaderboard,
        bundleName: "hallLeaderboard",
        bundleSubPath: "social/hallLeaderboard",
        category: "social",
        legacyBundleNames: ["rankings"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: ["RankingsDialog", "RankingsEndTipDialog", "RankingsOptin", "RankingsPopActDialog"],
    },
    {
        bundleKey: BundleKey.TableProps,
        bundleName: "tableProps",
        bundleSubPath: "tableChrome/tableProps",
        category: "tableChrome",
        legacyBundleNames: ["props_manage"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: ["PropsManageDialog", "PropsManageRoomDialog"],
    },
    {
        bundleKey: BundleKey.RoomLeaderboard,
        bundleName: "roomLeaderboard",
        bundleSubPath: "tableChrome/roomLeaderboard",
        category: "tableChrome",
        legacyBundleNames: ["game_act_leaderboard"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: ["game_act_leaderboard"],
    },
    {
        bundleKey: BundleKey.TableTheme,
        bundleName: "tableTheme",
        bundleSubPath: "tableChrome/tableTheme",
        category: "tableChrome",
        legacyBundleNames: ["desk"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: [],
    },
    {
        bundleKey: BundleKey.GameRules,
        bundleName: "gameRules",
        bundleSubPath: "tableChrome/gameRules",
        category: "tableChrome",
        legacyBundleNames: ["regular"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: ["game_regular_node", "regular_node"],
    },
    {
        bundleKey: BundleKey.Audio,
        bundleName: "audio",
        bundleSubPath: "shared/audio",
        category: "shared",
        legacyBundleNames: ["sound"],
        kind: BundleKind.Function,
        sceneName: null,
        sceneNames: [],
        dialogs: [],
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


export function resolveBundleLoadName(bundleName: string): string {
    const normalized = bundleName.trim();
    return LEGACY_BUNDLE_NAME_TO_CURRENT[normalized] ?? normalized;
}

export function getBundleAssetPath(entry: BundleManifestEntry): string {
    if (entry.bundleSubPath) {
        return `${FUNCTION_BUNDLE_ROOT}/${entry.bundleSubPath}`;
    }
    if (entry.kind === BundleKind.Function) {
        return `${FUNCTION_BUNDLE_ROOT}/${entry.bundleName}`;
    }
    if (entry.kind === BundleKind.Activity) {
        return `subpackage/activity/${entry.bundleName}`;
    }
    return `subpackage/games/${entry.bundleName}`;
}

/** Dynamic import path from `assets/script/game/` to a function bundle script module. */
export function getFunctionBundleImportPath(bundleKey: BundleKey, modulePath: string): string {
    const entry = getManifestEntry(bundleKey);
    if (!entry?.bundleSubPath) {
        throw new Error(`getFunctionBundleImportPath: missing bundleSubPath for ${bundleKey}`);
    }
    const rel = modulePath.startsWith("script/") ? modulePath : `script/${modulePath}`;
    return `../../../${FUNCTION_BUNDLE_ROOT}/${entry.bundleSubPath}/${rel}`;
}

const BUNDLE_KEY_TO_ENTRY = new Map<BundleKey, BundleManifestEntry>();
const BUNDLE_NAME_TO_ENTRY = new Map<string, BundleManifestEntry>();
for (const entry of BUNDLE_MANIFEST) {
    BUNDLE_KEY_TO_ENTRY.set(entry.bundleKey, entry);
    BUNDLE_NAME_TO_ENTRY.set(entry.bundleName, entry);
    if (entry.legacyBundleNames) {
        for (const legacy of entry.legacyBundleNames) {
            BUNDLE_NAME_TO_ENTRY.set(legacy, entry);
        }
    }
}
for (const [legacy, current] of Object.entries(LEGACY_BUNDLE_NAME_TO_CURRENT)) {
    if (!BUNDLE_NAME_TO_ENTRY.has(legacy)) {
        const entry = BUNDLE_NAME_TO_ENTRY.get(current);
        if (entry) {
            BUNDLE_NAME_TO_ENTRY.set(legacy, entry);
        }
    }
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

# Function bundle map (111assets parity)

## Layout (`assets/subpackage/function/`)

| Category | Bundles (`bundleName` = leaf folder) |
|----------|--------------------------------------|
| **hall** | `lobby`, `hallMenu`, `hallHeader`, `roomSelect`, `sceneSwitch` |
| **commerce** | `wallet`, `quickRecharge`, `vipClub`, `kyc` |
| **social** | `inviteShare`, `hallLeaderboard` |
| **tableChrome** | `tableTheme`, `tableProps`, `roomLeaderboard`, `gameRules`, `networkOverlay` |
| **shared** | `commonUi`, `audio` |

Paths: `function/{category}/{bundleName}/`. `BundleManifest.bundleSubPath` + `resolveBundleLoadName()` handle legacy hot-update names (e.g. `carte` → `hallMenu`). New `wr*` globals (`wrHallMenu`, `wrWallet`, …) mirror old names (`wrCarte`, `wrPayment`, …) as aliases.

**Hot-update (one release):** ship CDN bundles under new leaf `bundleName`s; optional parallel legacy names. Client `BundleSystem.loadBundle` resolves via `LEGACY_BUNDLE_NAME_TO_CURRENT` + `getManifestEntryByBundleName` legacy map.

**Smoke:** hall menu → wallet/FAQ; hall header mail; room select Play Now; scene switch enter/leave Rummy; quick recharge; KYC gate; invite share; hall leaderboard; in-room leaderboard + network overlay; game rules dialog.

| Legacy folder / `bundleName` | Category path | `BundleKey` | Current `bundleName` |
|-----------------------------|---------------|-------------|----------------------|
| bundle_hall / `lobby` | hall/lobby | Lobby | lobby |
| bundle_menu / `carte` | hall/hallMenu | HallMenu | hallMenu |
| bundle_hallTopUI / `lobbyTopView` | hall/hallHeader | HallHeader | hallHeader |
| bundle_chooseGame / `selectionVenue` | hall/roomSelect | RoomSelect | roomSelect |
| bundle_switch / `transition` | hall/sceneSwitch | SceneSwitch | sceneSwitch |
| bundle_wallet / `purse` | commerce/wallet | Wallet | wallet |
| Bundle_QuickCharge / `fast_buy` | commerce/quickRecharge | QuickRecharge | quickRecharge |
| bundle_club / `membership` | commerce/vipClub | VipClub | vipClub |
| Bundle_kyc / `verify` | commerce/kyc | Kyc | kyc |
| bundle_invite / `comm_share` | social/inviteShare | InviteShare | inviteShare |
| Bundle_leaderBoards / `rankings` | social/hallLeaderboard | HallLeaderboard | hallLeaderboard |
| bundle_desk / `desk` | tableChrome/tableTheme | TableTheme | tableTheme |
| Bundle_game_display / `props_manage` | tableChrome/tableProps | TableProps | tableProps |
| Bundle_room_act_rank / `game_act_leaderboard` | tableChrome/roomLeaderboard | RoomLeaderboard | roomLeaderboard |
| bundle_rule / `regular` | tableChrome/gameRules | GameRules | gameRules |
| bundle_networkdelay | tableChrome/networkOverlay | NetworkOverlay | networkOverlay |
| bundle_public / `public` | shared/commonUi | CommonUi | commonUi |
| bundle_sound / `sound` | shared/audio | Audio | audio |

## Hall lobby (`bundle_hall` → `lobby`)

- Enter: login `EnterLobbyCommand` → `goLobby` scene; `LobbySceneController.onLoad` → `wrLobby.onLobbyEnter()` (1008 bootstrap then **1025** hall home).
- Data: [`lobby/script`](wr-rummy-client/assets/subpackage/function/hall/lobby/script) — `LobbyModule`, `LobbyModel`, `FetchHallHomeCommand`, `ApplyHallActVisibilityCommand`, `HallActivityRouter`.
- Global API: `globalThis.wrLobby` — `refreshHallActButtons`, `openActivityCenter`, `openEmailMain`, `openGameAlreadyJoined`, `openByActId`, `refreshFromHallHome`, commerce `openShop` / `openFastBuy`.
- Cross-bundle: hallMenu (**1008**), hallHeader (mail/activity center), inviteShare (invite tab + `LobbyActivityQueue`), roomSelect (Rummy list), activity bundles via `HallActivityRouter`.
- Prefabs: `LobbyAd` (`LobbyBannerView`), `GameAlreadyJoinedDialog`, P1 shells `FilterMatchDialog` / `AddRoomDialog` / `DoubleRummyTypeDialog`.
- Server: [lobby-hall-e2e.md](../../wr-rummy-server/docs/lobby-hall-e2e.md) route **1025** `LobbyHallHome`; config `configs/lobby/hall_home.json`.
| bundle_hallTopUI | lobbyTopView | LobbyTopView | lobbyTopView |

## Public UI (`bundle_public` → `shared/commonUi`)

- API: `globalThis.wrCommonUi` (alias `wrPublic`) — `ensureRegistered`, `preload`, `applySupportChannels`, `showAlert`, `showHelp`, `openFaq`, `openContactUs`, `openFeedback`, `openGameSetting`, `showRewardTips`, `openMatchAlert`, `openMatchRank`, `openMatchPrizesRank`, `openBuddyJoin`.
- Logic: [`public/script`](wr-rummy-client/assets/subpackage/function/shared/commonUi/script) — `PublicModel`, commands (`FetchFaqPageCommand`, `SubmitFeedbackCommand`, `OpenCommonDialogCommand`, …), dialogs under `ui/`.
- Routes: **1009** FAQ, **1010** feedback; support channels from HTTP bootstrap `support` and optional **1008** `support`.
- Entry: carte FAQ/contact; membership help → `showHelp`; network delay disconnect → `showAlert`; Rummy menu `onGameSettingClick` → `openGameSetting({ landscape: true })`.
- Server: [public-support-e2e.md](../../wr-rummy-server/docs/public-support-e2e.md).

## Hall top UI (`bundle_hallTopUI` → `hall/hallHeader`)

- Open: `wrLobby.openEmailMain` / `openActivityCenter` / `openAnnouncement` or `globalThis.wrHallHeader` (alias `wrLobbyTopView`).
- Mail: routes **1026–1029** (`FetchInboxListCommand`, read/delete/claim); unread synced with **1025** `un_read_email`.
- Activity center: reads **1025** `act_collect_open` from `LobbyModel`; taps → `wrLobby.openByActId`.
- Announce queue: **1030** `FetchAnnounceNextCommand` + `LobbyActivityQueue` on close (`isNext`).
- Tournament detail: **4003** `MatchDetailsDialog` via `openMatchDetails({ tournamentId })`.
- Redeem: `RedemptionCodeDialog` + carte **1341** (or topView command).
- Logic: [`lobbyTopView/script`](wr-rummy-client/assets/subpackage/function/hall/hallHeader/script); server [lobby-topview-inbox-e2e.md](../../wr-rummy-server/docs/lobby-topview-inbox-e2e.md).
| bundle_switch | transition | Transition | transition — see [Scene transition](#scene-transition-bundle_switch--transition) |
| bundle_chooseGame | selectionVenue | SelectionVenue | selectionVenue — see [Hall choose game](#hall-choose-game-bundle_choosegame--selectionvenue) |

## Scene transition (`bundle_switch` → `transition`)

- Scene: `Transition` — `hall_bg` / `room_bg` / `login_bg` hub between lobby and sub-games (legacy `switchSceneTye` 1/2/3).
- API: `globalThis.wrTransition` — `ensureRegistered`, `preload`, `shouldUse`, `start(intent)`.
- Logic: [`transition/script`](wr-rummy-client/assets/subpackage/function/hall/sceneSwitch/script) — `TransitionModel`, `StartTransitionCommand`, `RunTransitionPipelineCommand`, `TransitionLayerController`, `TransitionSceneController`.
- Flow: `EnterSubGameCommand` / `BundleSystem.enterGame` → `ToSubGame` transition → `enterGameDirect`; `LeaveSubGameCommand` → game leave routes → `min_exit_game_ms` → `ToLobby` → `goLobbyDirect` + `wrLobby.onLobbyEnter(1, vid)` (**1008** + **1025** `is_back_to_hall`).
- Desk preview: `wrDesk.preload()` + `ApplyRoomBgCommand` on `room_bg` (`scene: "transition"`).
- Preload: [`BundleSystem.preloadLobby`](wr-rummy-client/assets/script/game/system/BundleSystem.ts) includes `transition`.
- Server: HTTP bootstrap `transition` object — [transition-e2e.md](../../wr-rummy-server/docs/transition-e2e.md) (no Due route).
| bundle_menu | carte | Carte | carte |
| bundle_wallet | purse | Purse | purse |

## Wallet / shop / withdraw (`bundle_wallet` → `purse`)

- API: `globalThis.wrPayment` — `ensureRegistered`, `openPurse`, `openShopMain`, `openWithdrawalMain`, `openPurseHistory`, `openHallFastBuy`, `openGameFastBuy`, `openCouponPop`, `openPaymentSelect`, `openPersonMsgBind`, `openKycPhoto`, `openMembership`.
- Domain: main package [`game/commerce`](wr-rummy-client/assets/script/game/commerce) (`PaymentModel`, routes **1401–1422**, push **1430**); UI in [`purse/script`](wr-rummy-client/assets/subpackage/function/commerce/wallet/script).
- Entry: carte Wallet/Store/Withdraw/Transactions; lobby `add_cash` / `wallet_root`; `wrLobby.openShop`.
- Cross-bundle: `verify` (KYC, phone/email bind), `membership`, `fast_buy`, `public` (confirm/help).
- Server: [purse-wallet-e2e.md](../../wr-rummy-server/docs/purse-wallet-e2e.md), [payment-e2e.md](../../wr-rummy-server/docs/payment-e2e.md).
| Bundle_QuickCharge | fast_buy | FastBuy | fast_buy |
| bundle_club | membership | Membership | membership |
| Bundle_kyc | verify | Verify | verify — see [KYC / profile bind](#kyc--profile-bind-bundle_kyc--verify) |
| bundle_invite | comm_share | CommShare | comm_share |

## KYC / profile bind (`Bundle_kyc` → `verify`)

- API: `globalThis.wrVerify` — `ensureRegistered`, `preload`, `openKycPhoto`, `openPersonMsgBind`, `promptKycGate`.
- Legacy `wrPayment.openKycPhoto` / `openPersonMsgBind` delegate to `wrVerify`.
- UI: [`verify/script`](wr-rummy-client/assets/subpackage/function/commerce/kyc/script) — `PersonMsgBindDialog` (1414/1415), `KycPhotoDialog` (legacy photo shell + MVP **1418** submit on item2).
- Domain data: `PaymentModel.kycPage` / `profile` via [`game/commerce`](wr-rummy-client/assets/script/game/commerce) commands; verify commands wrap network + UI state (`VerifyModel` OTP cooldown).
- Gates: `VerifyKycGate` — shop **1402** `kyc_gate`, fast buy `check_kyc`, withdraw **1408** `kyc_check`.
- Prefabs: `PersonMsgBindDialog`, `KycPhoto`.
- Server: [verify-e2e.md](../../wr-rummy-server/docs/verify-e2e.md) routes **1414–1418**; P2 document upload / `KycUpdate` resubmit not in bundle.
| Bundle_leaderBoards | rankings | Rankings | rankings — see [Hall rankings](#hall-challenger-rankings-bundle_leaderboards--rankings) |
| Bundle_game_display | props_manage | PropsManage | props_manage |
| Bundle_room_act_rank | game_act_leaderboard | GameActLeaderboard | game_act_leaderboard |
| bundle_desk | desk | Desk | desk |
| bundle_rule | regular | Regular | regular — see [How to Play / rules](#how-to-play--rules-bundle_rule--regular) |
| bundle_sound | sound | Sound | sound |

## Hall choose game (`bundle_chooseGame` → `selectionVenue`)

- API: `globalThis.wrSelectionVenue` — `open`, `prefetchCatalog`, `preload`, `ensureRegistered`.
- UI: [`selectionVenue/script`](wr-rummy-client/assets/subpackage/function/hall/roomSelect/script) — `RummySelection` (`RummySelectionDialog`): Cash/Practice/Buddy/Match tabs, Points/Pool/Deals, room slider, Play Now.
- Data: lobby route **1033** `LobbyHallRoomCatalog` → `SelectionVenueModel` + local `commRoomData` cache; flags from **1008** `config.rummy_rules`.
- Enter table: `EnterRummyFromSelectionCommand` → `EnterSubGameCommand(Rummy)` + `vid`/`template_id` from catalog row.
- Cross-bundle: `wrPayment.openHallFastBuy` (add cash), `wrRegular.openHall` (mode help), `wrPublic.openBuddyJoin` (buddy), `FilterMatchDialog` / `DoubleRummyTypeDialog` in **lobby** (lazy open).
- Entry: lobby play / `LobbySceneController.openRummySelection`; prefetch on `wrLobby.onLobbyEnter`.
- **Not** here: Cricket match picker — [`cricket_game`](wr-rummy-client/assets/subpackage/games/bet/cricket) `CricketChooseGameView`.
- Server: [selection-venue-e2e.md](../../wr-rummy-server/docs/selection-venue-e2e.md); config `configs/lobby/rummy_room_catalog.json`.

## How to Play / rules (`bundle_rule` → `regular`)

- **Not** FAQ: short Q&A stays [`public`](wr-rummy-client/assets/subpackage/function/shared/commonUi/script) **1009** + `wrPublic.openFaq()`; **How to Play** is local rule art/text in `regular`.
- API: `globalThis.wrRegular` — `openHall`, `openInGame`, `openInGameHelp`, `openRummyInGame`, `preload`, `ensureRegistered`.
- UI: [`regular/script`](wr-rummy-client/assets/subpackage/function/tableChrome/gameRules/script) — `regular_node` (`RegularNodeDialog`: point/pool/deal tabs, Deals long text, rummy sub-mode flags), `game_regular_node` (`GameRegularDialog`: image or text, landscape).
- Hall flags: lobby **1008** `config.rummy_rules` → `HallConfigModel` (`isPointsEasyMode`, `isMultipleRummyOpen`, …).
- In-game bet help: HTTP `/v1/bootstrap` `game_help` → `AppBootstrapModel.gameHelp`; `OpenGameRegularCommand` resolves `rocket` / `sixpoint` / `cricket` / `fruit_slot`.
- Entry: carte **How to Play** → `wrRegular.openHall`; Rummy `onRulesHelpClick` → `openRummyInGame` (landscape); Rocket/Sixpoint/Cricket `onHelpClick` (P1, bind in scene).
- Preload: optional in [`BundleSystem.preloadLobby`](wr-rummy-client/assets/script/game/system/BundleSystem.ts) (`regular` bundle).
- Duplicate prefabs under `games/poker/rummy/prefab/RegularNodeDialog` / `GameRegularDialog` are legacy; maintain **function/regular** only.
- Server: [regular-rules-e2e.md](../../wr-rummy-server/docs/regular-rules-e2e.md); configs `configs/lobby/rummy_rule_flags.json`, `configs/client/game_help.json`.

## In-game network delay (`bundle_networkdelay`)

- API: `globalThis.wrNetworkDelay` — `attach`, `detach`, `showOverlay`, `setActiveDisconnect`, `ensureRegistered`.
- Config: HTTP `/v1/bootstrap` → `network_delay` (see [network-delay-e2e.md](../../wr-rummy-server/docs/network-delay-e2e.md)).
- Logic: [`networkdelay/script`](wr-rummy-client/assets/subpackage/function/tableChrome/networkOverlay/script) — `NetworkDelaySystem` (silent sec watchdog), overlay prefab `network_bg`.
- Rummy: [`RummyGameSceneController`](wr-rummy-client/assets/subpackage/games/poker/rummy/script/controller/RummyGameSceneController.ts) attach on enter; `NetSignalBinder` for `signal` / `delay_ms`.
- Preload: [`BundleSystem.preloadLobby`](wr-rummy-client/assets/script/game/system/BundleSystem.ts) includes `networkdelay`.

Commerce logic (routes/commands) lives in `assets/script/game/commerce/`. Wallet UI entry: `globalThis.wrPayment` via `purse/script/PurseModule.ts`.

## CLUB membership (`bundle_club` → `membership`)

- Open: carte menu Club, purse `membership_btn`, lobby `btn_clubInfo`, or `globalThis.wrMembership.open()`.
- Data: [`membership/script`](wr-rummy-client/assets/subpackage/function/commerce/vipClub/script) — `MembershipModel`, **1031** `FetchMembershipClubPageCommand`, **1032** ack, **1432** push via `RegisterMembershipPushCommand`.
- Summary: main package **1419** `FetchMembershipPageCommand` → `PaymentModel.membershipPage` (server delegates to membership module).
- Upgrade pop: `MembershipUpgradeDialog` / `MembershipUpgradeGameDialog`; hall queue via `LobbyActivityQueue`.
- `pingbi.club` hides carte Club + lobby `btn_clubInfo`.
- Server: [membership-club-e2e.md](../../wr-rummy-server/docs/membership-club-e2e.md).

Hot-update: retired bundle names `common`, `payment`, `social` — update CDN manifest when shipping.

## Carte menu (`bundle_menu`)

- Open: lobby `btn_menu` or `globalThis.wrCarte.open()` → [`carte/script/CarteModule.ts`](../assets/subpackage/function/hall/hallMenu/script/CarteModule.ts).
- Hall data: [`carte/script`](wr-rummy-client/assets/subpackage/function/hall/hallMenu/script) (`config/HallConfig`, `command/*`, `model/*`, `ensureHallRegistered`) + payment 1401/1419/1430.
- Cross-bundle jumps: purse (wallet/shop/withdraw/membership), public (FAQ/contact), **regular** (How to Play), lobbyTopView (redeem), rankings, lobby (`LobbyLogoutDialog`).

## Quick charge (`Bundle_QuickCharge` → `fast_buy`)

- Open: lobby commerce hook `openFastBuy` → `wrFastBuy.openHall()` / `wrPayment.openHallFastBuy()`; in-game `PlatformSystem.startCricketRecharge` / `RummyMoneyLessEvent` → `openGameFastBuy`.
- UI: [`fast_buy/script`](wr-rummy-client/assets/subpackage/function/commerce/quickRecharge/script) (`HallFastBuyDialog`, `GameFastBuyDialog`, `FastBuyModule`).
- Data: main package [`game/commerce`](wr-rummy-client/assets/script/game/commerce) — **1420** `FetchFastBuyPageCommand`, **1403** `StartShopPurchaseCommand` with `fast_buy: 1`.
- Legacy entry: [`FastBuyEntry.showQuickRecharge`](wr-rummy-client/assets/script/game/commerce/utility/FastBuyEntry.ts).

## Desk backgrounds (`bundle_desk` → `desk`)

- Preload: lobby/transition `onLoad` → `wrDesk.preload()`; login → `onDeskLoginSuccess()`.
- Logic: [`desk/script`](wr-rummy-client/assets/subpackage/function/tableChrome/tableTheme/script) (`DeskStyleModel`, `RoomBgBinder`, `ApplyRoomBgCommand`, `ensureDeskRegistered`).
- CDN: HTTP bootstrap `remote_desk_url`; assets under `desk/big_pic/`.
- Server: [desk-props-api.md](../../wr-rummy-server/docs/desk-props-api.md); hall **1008** skin fields; props **1021–1024**.

## Props / game display (`Bundle_game_display` → `props_manage`)

- API: `globalThis.wrPropsManage` — `open` (hall avatar/name), `openRoom` (table/face/back), `refreshPage`, `ensureRegistered`.
- Routes **1021–1024**; config [`configs/props/catalog.json`](../../wr-rummy-server/configs/props/catalog.json); E2E [props-manage-e2e.md](../../wr-rummy-server/docs/props-manage-e2e.md).
- Logic: [`props_manage/script`](wr-rummy-client/assets/subpackage/function/tableChrome/tableProps/script) (`PropsManageModel`, commands, `PropsManageDialog` / `PropsManageRoomDialog`).
- **desk** owns `DeskStyleModel`, CDN `big_pic`, `DeskStyleChangedEvent`; props commands write styles after **1022** / **1021** equipped.
- Entry: lobby `wrLobby.openPropsManage`; Rummy menu `onGameDisplayClick` → `openRoom`; carte `game_display_go`.

## Hall challenger rankings (`Bundle_leaderBoards` → `rankings`)

- Open: carte `challenger_go`, lobby `btn_leaderboard`, `wrLobby.openRankings()` / `wrRankings.open()` when **1008** `player.challenger_open === 1`.
- UI: [`rankings/script`](wr-rummy-client/assets/subpackage/function/social/hallLeaderboard/script) — `RankingsDialog`, `RankingsPopActDialog`, `RankingsOptin`, `RankingsEndTipDialog`; `RankingsModel` + routes **1347–1352**.
- Shared opt-in: main package [`game/challenger`](wr-rummy-client/assets/script/game/challenger) **1343** `ChallengerOptEntryCommand` + `ChallengerEntryModel` (also used by `game_act_leaderboard`).
- Pop queue: `wrRankings.openPopAct` / `openEndTip` → `LobbyActivityQueue`.
- Server: [challenger-hall-rank-e2e.md](../../wr-rummy-server/docs/challenger-hall-rank-e2e.md); config `configs/activity/challenger/hall_rank.json`.
- **Not** in this bundle: in-room table UI (**1342–1345**) — use `game_act_leaderboard` only.

## In-room challenger rank (`Bundle_room_act_rank` → `game_act_leaderboard`)

- Open: Rummy `leader_boards_btn` → `wrGameActRank.open({ vid, tidKey })`.
- Prefetch: join table → `wrGameActRank.prefetch(vid)` toggles button via `RoomChallengerVisibilityEvent`.
- UI: [`game_act_leaderboard/script`](wr-rummy-client/assets/subpackage/function/tableChrome/roomLeaderboard/script) (`GameActLeaderboardDialog`, `GameActLeaderboardModel`, routes **1342–1345**).
- Opt-in: **1343** via `ChallengerOptEntryCommand` (shared store with hall `rankings`).
- Server: [challenger-room-rank-e2e.md](../../wr-rummy-server/docs/challenger-room-rank-e2e.md); bootstrap **1008** `is_new_rank`, `challenger_open`.

## Invite / share (`bundle_invite` → `comm_share`)

- Open: lobby `btn_invite` (embedded under `invite_root`) or `globalThis.wrLobby.openShare` / `wrCommShare.openMain()`.
- Pop: `wrLobby.openSharePopAct(data)` → `SharePopActDialog` (activity queue via `LobbyActivityQueue`).
- Data: [`comm_share/script`](wr-rummy-client/assets/subpackage/function/social/inviteShare/script) (`config/ShareConfig`, `model/ShareModel`, `command/*`, `ensureCommShareRegistered`).
- Server: [comm-share-api.md](../../wr-rummy-server/docs/comm-share-api.md); push **1431** for invite reward flag.
- Textures: `comm_share/texture/` (from 111assets `comm_share/picture`).

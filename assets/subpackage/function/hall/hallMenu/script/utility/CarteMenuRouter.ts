import { GameApp } from "../../../../../script/game/GameApp";
import { EnterSubGameCommand } from "../../../../../script/game/command/EnterSubGameCommand";
import { SubGameId } from "../../../../../script/game/config/BundleManifest";
import { HallConfigModel } from "../model/HallConfigModel";
import { WalletModel } from "../../../../../script/game/model/WalletModel";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { PurseI18n } from "../../../commerce/wallet/script/config/PurseConfig";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { sys } from "cc";
import { CarteActions } from "../config/CarteConfig";
import { HallPlayerModel } from "../model/HallPlayerModel";

export async function routeCarteAction(action: string): Promise<void> {
    if (action.startsWith("group_arrow")) {
        return;
    }
    try {
        switch (action) {
            case CarteActions.Wallet:
            case CarteActions.Head:
                await import("../../../commerce/wallet/script/PurseModule").then((m) => m.openPurseDialog());
                break;
            case CarteActions.GameDisplay:
                await import("../../../tableChrome/tableProps/script/PropsManageModule").then((m) => m.openPropsManageDialog());
                break;
            case CarteActions.Store: {
                const chips = GameApp.Interface.GetModel(HallConfigModel).chipsModel;
                if (chips) {
                    return;
                }
                const shopOpen = GameApp.Interface.GetModel(WalletModel).snapshot.value.shop_open;
                if (shopOpen === 0) {
                    GameApp.Interface.GetSystem(UISystem).showToast(PurseI18n.shopClosed);
                    return;
                }
                await import("../../../commerce/wallet/script/PurseModule").then((m) => m.openShopMain());
                break;
            }
            case CarteActions.Withdrawal: {
                const blocked = GameApp.Interface.GetModel(HallConfigModel).config.value.pingbi?.withdraw;
                if (blocked) {
                    GameApp.Interface.GetSystem(UISystem).showToast(PurseI18n.withdrawBlocked);
                    return;
                }
                await import("../../../commerce/wallet/script/PurseModule").then((m) => m.openWithdrawalMain());
                break;
            }
            case CarteActions.Transactions:
                await import("../../../commerce/wallet/script/PurseModule").then((m) => m.openPurseHistory());
                break;
            case CarteActions.Contact:
                await import("../../../shared/commonUi/script/PublicModule").then((m) => m.openContactUs());
                break;
            case CarteActions.Faq:
                await import("../../../shared/commonUi/script/PublicModule").then((m) => m.openFaq());
                break;
            case CarteActions.HowToPlay: {
                const hallCfg = GameApp.Interface.GetModel(HallConfigModel);
                await import("../../../tableChrome/gameRules/script/RegularModule").then((m) =>
                    m.openHallRegular({
                        isEasy: hallCfg.isPointsEasyMode(),
                        isMultiple: hallCfg.isMultipleRummyOpen(),
                        isBump: hallCfg.isBumpRummyOpen(),
                    }),
                );
                break;
            }
            case CarteActions.Terms:
            case CarteActions.Privacy: {
                const help = GameApp.Interface.GetModel(HallConfigModel).help.value;
                const url = action === CarteActions.Terms ? help.tc_url : help.privacy_url;
                if (url) {
                    sys.openURL(url);
                }
                break;
            }
            case CarteActions.Club: {
                const clubBlocked = GameApp.Interface.GetModel(HallConfigModel).isClubBlocked();
                if (clubBlocked) {
                    LogKit.I("[CarteMenuRouter] club blocked by pingbi");
                    return;
                }
                await import("../../../commerce/wallet/script/PurseModule").then((m) => m.openMembership());
                break;
            }
            case CarteActions.Redeem: {
                const blocked = GameApp.Interface.GetModel(HallConfigModel).isRedeemBlocked();
                if (blocked) {
                    LogKit.I("[CarteMenuRouter] redeem blocked by pingbi");
                    return;
                }
                await import("../../hallHeader/script/LobbyTopViewModule").then((m) => m.openRedemptionCode());
                break;
            }
            case CarteActions.Rankings: {
                const open = Number(GameApp.Interface.GetModel(HallPlayerModel).player.value.challenger_open ?? 1);
                if (open !== 1) {
                    LogKit.I("[CarteMenuRouter] rankings blocked challenger_open=0");
                    return;
                }
                await import("../../../social/hallLeaderboard/script/RankingsModule").then((m) => m.openRankingsDialog());
                break;
            }
            case CarteActions.NewPlayerGuide:
                GameApp.Interface.SendCommand(new EnterSubGameCommand(SubGameId.Rummy));
                break;
            case CarteActions.Logout:
                await import("../../lobby/script/LobbyLogoutModule").then((m) => m.openLobbyLogout());
                break;
            default:
                LogKit.W("[CarteMenuRouter] unhandled action={0}", action);
        }
    } catch (err) {
        LogKit.E("[CarteMenuRouter] {0} {1}", action, err instanceof Error ? err.message : String(err));
    }
}

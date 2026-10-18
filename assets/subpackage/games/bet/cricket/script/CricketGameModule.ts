import { GameApp } from "../../../../../script/game/GameApp";
import { EnterSubGameCommand } from "../../../../../script/game/command/EnterSubGameCommand";
import { SubGameId } from "../../../../../script/game/config/BundleManifest";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { CricketDeepLinkData, CricketOpenData } from "./config/CricketProtocol";
import { CricketMoneyLessEvent } from "./event/CricketEvents";
import { CricketModel } from "./model/CricketModel";
import { CricketGameLogic } from "./CricketGameLogic";
import { CricketTeamUtility } from "./utility/CricketTeamUtility";
import { CricketUiUtility } from "./utility/CricketUiUtility";
import { showCricketToast } from "./utility/CricketUiHelper";
import { CricketMainView } from "./ui/CricketMainView";
import { CricketChooseGameView } from "./ui/CricketChooseGameView";
import { CricketCreateTeamView } from "./ui/CricketCreateTeamView";
import { CricketCaptainSelectView } from "./ui/CricketCaptainSelectView";
import { CricketTeamListView } from "./ui/CricketTeamListView";
import { CricketEndView } from "./ui/CricketEndView";
import { CricketAssureJoinDialog } from "./ui/dialogs/CricketAssureJoinDialog";
import { CricketJoinListDialog } from "./ui/dialogs/CricketJoinListDialog";
import { CricketSwitchListDialog } from "./ui/dialogs/CricketSwitchListDialog";
import { CricketGameDetailsDialog } from "./ui/dialogs/CricketGameDetailsDialog";

let registered = false;
let moneyLessHooked = false;

export function ensureCricketRegistered(): void {
    if (registered) {
        return;
    }
    GameApp.Interface.RegisterModel(new CricketModel());
    GameApp.Interface.RegisterUtility(new CricketTeamUtility());
    GameApp.Interface.RegisterUtility(new CricketUiUtility());
    registered = true;
    if (!moneyLessHooked) {
        moneyLessHooked = true;
        GameApp.Interface.RegisterEvent(CricketMoneyLessEvent, () => {
            showCricketToast("Insufficient balance");
        }, GameApp.Interface);
    }
}

export async function openCricketMainView(): Promise<void> {
    ensureCricketRegistered();
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(CricketMainView, BundleKey.Cricket, "CricketMain", {
        level: UILevel.CanvasPanel,
    });
}

export async function openCricketChooseGameView(uiData?: CricketOpenData): Promise<void> {
    ensureCricketRegistered();
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(CricketChooseGameView, BundleKey.Cricket, "CricketChooseGame", {
        uiData: uiData ?? {},
        level: UILevel.CanvasPanel,
    });
}

export async function openCricketCreateTeamView(matchId: number): Promise<void> {
    ensureCricketRegistered();
    const model = GameApp.Interface.GetModel(CricketModel);
    model.curMatchId.value = matchId;
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(CricketCreateTeamView, BundleKey.Cricket, "CricketCreateTeam", {
        uiData: { match_id: matchId },
        level: UILevel.CanvasPanel,
    });
}

export async function openCricketCaptainSelectView(): Promise<void> {
    ensureCricketRegistered();
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(CricketCaptainSelectView, BundleKey.Cricket, "CricketCaptainSelect", {
        level: UILevel.CanvasPanel,
    });
}

export async function openCricketAssureJoinDialog(matchId: number, contestId: number, teamId: number): Promise<void> {
    ensureCricketRegistered();
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(CricketAssureJoinDialog, BundleKey.Cricket, "CricketAssureJoinDialog", {
        uiData: { match_id: matchId, contest_id: contestId, team_id: teamId },
        level: UILevel.PopUI,
    });
}

export async function openCricketJoinListDialog(matchId: number): Promise<void> {
    ensureCricketRegistered();
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(CricketJoinListDialog, BundleKey.Cricket, "CricketJoinListDialog", {
        uiData: { match_id: matchId },
        level: UILevel.PopUI,
    });
}

export async function openCricketSwitchListDialog(uiData: CricketOpenData): Promise<void> {
    ensureCricketRegistered();
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(CricketSwitchListDialog, BundleKey.Cricket, "CricketSwitchListDialog", {
        uiData,
        level: UILevel.PopUI,
    });
}

export async function openCricketTeamListView(matchId: number): Promise<void> {
    ensureCricketRegistered();
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(CricketTeamListView, BundleKey.Cricket, "CricketTeamList", {
        uiData: { match_id: matchId },
        level: UILevel.CanvasPanel,
    });
}

export async function openCricketEndView(uiData: CricketOpenData): Promise<void> {
    ensureCricketRegistered();
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(CricketEndView, BundleKey.Cricket, "CricketEnd", {
        uiData,
        level: UILevel.CanvasPanel,
    });
}

export async function openCricketGameDetailsDialog(uiData: CricketOpenData): Promise<void> {
    ensureCricketRegistered();
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(CricketGameDetailsDialog, BundleKey.Cricket, "CricketGameDetails", {
        uiData,
        level: UILevel.PopUI,
    });
}

export function enterCricketSubGame(): void {
    GameApp.Interface.SendCommand(new EnterSubGameCommand(SubGameId.Cricket));
}

export function handleCricketDeepLink(payload: CricketDeepLinkData): void {
    ensureCricketRegistered();
    const matchId = payload.match_id ?? 0;
    if (matchId <= 0) {
        void openCricketMainView();
        return;
    }
    new CricketGameLogic().openFromDeepLink(matchId);
}

if (typeof globalThis !== "undefined") {
    (globalThis as { wrCricket?: Record<string, unknown> }).wrCricket = {
        enter: enterCricketSubGame,
        openMain: openCricketMainView,
        deepLink: handleCricketDeepLink,
    };
}

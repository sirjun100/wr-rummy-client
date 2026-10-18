import { GameApp } from "../../../../../script/game/GameApp";
import { FetchCricketAllContestListCommand } from "./command/FetchCricketAllContestListCommand";
import { FetchCricketCreateTeamCheckCommand } from "./command/FetchCricketCreateTeamCheckCommand";
import { PreJoinCricketContestCommand } from "./command/PreJoinCricketContestCommand";
import {
    openCricketAssureJoinDialog,
    openCricketChooseGameView,
    openCricketCreateTeamView,
} from "./CricketGameModule";

/** Cross-view flow orchestration (non-Component). */
export class CricketGameLogic {
    private static mainViewOpen = false;

    public static isMainViewOpen(): boolean {
        return CricketGameLogic.mainViewOpen;
    }

    public static setMainViewOpen(open: boolean): void {
        CricketGameLogic.mainViewOpen = open;
    }

    public openMatchContests(matchId: number): void {
        GameApp.Interface.SendCommand(new FetchCricketAllContestListCommand(matchId));
        void openCricketChooseGameView({ match_id: matchId });
    }

    public startCreateTeamFlow(matchId: number): void {
        GameApp.Interface.SendCommand(new FetchCricketCreateTeamCheckCommand(matchId));
        void openCricketCreateTeamView(matchId);
    }

    public startSignFlow(matchId: number, contestId: number, teamId: number): void {
        GameApp.Interface.SendCommand(new PreJoinCricketContestCommand(matchId, contestId, teamId));
        void openCricketAssureJoinDialog(matchId, contestId, teamId);
    }

    /** Deep link / share: open choose game when main is not shown. */
    public openFromDeepLink(matchId: number): void {
        if (CricketGameLogic.mainViewOpen) {
            return;
        }
        this.openMatchContests(matchId);
    }
}

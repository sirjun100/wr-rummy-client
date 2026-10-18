import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { PlatformSystem } from "../../../../../../script/game/system/PlatformSystem";
import {
    CricketContestListDto,
    CricketCreateTeamCheckDto,
    CricketEnterDto,
    CricketMatchListDto,
    CricketRoute,
    CricketSignResultDto,
    CricketTeamListDto,
    CricketUserTeamDto,
} from "../config/CricketProtocol";
import {
    CricketCloseCreateTeamFlowEvent,
    CricketEnterReadyEvent,
    CricketListRefreshEvent,
    CricketMoneyLessEvent,
    CricketSignSuccessEvent,
} from "../event/CricketEvents";
import { CricketModel } from "../model/CricketModel";
import { callCricket } from "../utility/CricketNetwork";
import { CricketTeamUtility } from "../utility/CricketTeamUtility";
import { isCricketMoneyLessError, logCricketCommandError } from "../utility/CricketCommandHelper";

export class UpdateCricketBackupTeamCommand extends AbstractCommand {
    public constructor(
        private readonly teamId: number,
        private readonly playerIds: number[],
        private readonly captainId: number,
        private readonly viceId: number,
        private readonly backupIds: number[],
    ) {
        super();
    }

    protected OnExecute(): void {
        void callCricket(this.GetSystem(NetworkSystem), CricketRoute.UpdateBackupTeam, {
            team_id: this.teamId,
            player_ids: this.playerIds,
            captain_id: this.captainId,
            vice_captain_id: this.viceId,
            backup_ids: this.backupIds,
        }).catch((e) => logCricketCommandError("UpdateBackupTeam", e));
    }
}

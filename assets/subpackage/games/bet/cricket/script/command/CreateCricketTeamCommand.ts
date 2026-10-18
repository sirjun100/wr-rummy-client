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

import { FetchCricketTeamListCommand } from "./FetchCricketTeamListCommand";

export class CreateCricketTeamCommand extends AbstractCommand {
    public constructor(
        private readonly matchId: number,
        private readonly teamName: string,
        private readonly playerIds: number[],
        private readonly captainId: number,
        private readonly viceId: number,
        private readonly backupIds: number[] = [],
    ) {
        super();
    }

    protected OnExecute(): void {
        const util = this.GetUtility(CricketTeamUtility);
        if (!util.validateLocal(this.playerIds, this.captainId, this.viceId)) {
            return;
        }
        void callCricket<CricketUserTeamDto>(this.GetSystem(NetworkSystem), CricketRoute.CreateTeam, {
            match_id: this.matchId,
            team_name: this.teamName,
            player_ids: this.playerIds,
            captain_id: this.captainId,
            vice_captain_id: this.viceId,
            backup_ids: this.backupIds,
        })
            .then(() => {
                this.SendCommand(new FetchCricketTeamListCommand(this.matchId));
                this.SendEvent(new CricketCloseCreateTeamFlowEvent());
            })
            .catch((e) => logCricketCommandError("CreateTeam", e));
    }
}

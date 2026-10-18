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

export class FetchCricketMyMatchListCommand extends AbstractCommand {
    public constructor(private readonly page = 1) {
        super();
    }

    protected OnExecute(): void {
        void callCricket<CricketMatchListDto>(this.GetSystem(NetworkSystem), CricketRoute.MyMatchList, {
            page: this.page,
        })
            .then((data) => {
                this.GetModel(CricketModel).myMatchList.value = data ?? null;
                this.SendEvent(new CricketListRefreshEvent());
            })
            .catch((e) => logCricketCommandError("MyMatchList", e));
    }
}

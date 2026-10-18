import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { ChallengerOptEntryCommand } from "../../../../../script/game/challenger/command/ChallengerOptEntryCommand";
import { GameActLeaderboardModel } from "../model/GameActLeaderboardModel";
import { FetchRoomChallengerPageCommand } from "./FetchRoomChallengerPageCommand";

export class SubmitChallengerOptInCommand extends AbstractCommand {
    public constructor(private readonly vid: number) {
        super();
    }

    protected OnExecute(): void {
        this.SendCommand(
            new ChallengerOptEntryCommand(1, () => {
                const status = 1;
                this.GetModel(GameActLeaderboardModel).entryStatus.value = status;
                this.SendCommand(new FetchRoomChallengerPageCommand(this.vid, "hour", 1, false));
            }),
        );
    }
}

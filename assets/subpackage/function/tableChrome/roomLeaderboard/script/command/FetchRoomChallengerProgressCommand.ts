import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { ChallengerRoute } from "../config/GameActLeaderboardConfig";
import type { RoomProgressRes } from "../config/GameActLeaderboardProtocol";
import { RoomChallengerProgressEvent } from "../event/GameActLeaderboardEvents";

export class FetchRoomChallengerProgressCommand extends AbstractCommand {
    public constructor(private readonly vid: number) {
        super();
    }

    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<RoomProgressRes>(ChallengerRoute.RoomProgress, { vid: this.vid })
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    return;
                }
                const list = res.data?.list ?? [];
                if (list.length > 0) {
                    this.SendEvent(new RoomChallengerProgressEvent(list));
                }
            })
            .catch((err) => {
                LogKit.W(
                    "[FetchRoomChallengerProgressCommand] {0}",
                    err instanceof Error ? err.message : String(err),
                );
            });
    }
}

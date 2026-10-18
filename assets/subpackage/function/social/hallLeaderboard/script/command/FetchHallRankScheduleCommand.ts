import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { RankingsRoute } from "../config/RankingsConfig";
import type { HallLobbyRes, HallScheduleDto } from "../config/RankingsProtocol";
import { RankingsModel } from "../model/RankingsModel";

export class FetchHallRankScheduleCommand extends AbstractCommand {
    public constructor(private readonly showAfter = false) {
        super();
    }

    protected OnExecute(): void {
        const model = this.GetModel(RankingsModel);
        const cycleSn = model.cycleSn || model.mainFrame.value.cycle_sn || 0;
        void this.GetSystem(NetworkSystem)
            .callLobby<HallLobbyRes<HallScheduleDto>>(RankingsRoute.HallSchedule, { cycle_sn: cycleSn })
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[FetchHallRankScheduleCommand] code={0}", res.code);
                    return;
                }
                model.schedule.value = res.data ?? {};
            })
            .catch((err) => {
                LogKit.W(
                    "[FetchHallRankScheduleCommand] {0}",
                    err instanceof Error ? err.message : String(err),
                );
            });
    }
}

import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { EarthquakesChipCheckRes, EarthquakesRoute } from "../config/EarthquakesConfig";
import { EarthquakesChipCheckReadyEvent } from "../event/EarthquakesEvents";

export class CheckEarthquakesChipRewardCommand extends AbstractCommand {
    public constructor(
        private readonly vid: number = 0,
        private readonly player: number = 6,
    ) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<EarthquakesChipCheckRes>(EarthquakesRoute.ChipCheck, {
                vid: this.vid,
                player: this.player,
                chip: 1,
            })
            .then((res) => {
                if (res.can_claim === 1 && res.task) {
                    this.SendEvent(
                        new EarthquakesChipCheckReadyEvent(
                            res,
                            res.task,
                            res.vid ?? this.vid,
                            res.player ?? this.player,
                        ),
                    );
                }
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[CheckEarthquakesChipRewardCommand] {0}", msg);
            });
    }
}

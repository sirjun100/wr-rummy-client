import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { EarthquakesChipClaimRes, EarthquakesRoute } from "../config/EarthquakesConfig";
import {
    EarthquakesChipClaimFailedEvent,
    EarthquakesChipClaimSuccessEvent,
} from "../event/EarthquakesEvents";
import { EarthquakesModel } from "../model/EarthquakesModel";

export class ClaimEarthquakesChipRewardCommand extends AbstractCommand {
    public constructor(
        private readonly vid: number,
        private readonly player: number,
    ) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<EarthquakesChipClaimRes>(EarthquakesRoute.ChipClaim, {
                vid: this.vid,
                player: this.player,
                chip: 1,
            })
            .then((res) => {
                if (res.task) {
                    this.GetModel(EarthquakesModel).task.value = res.task;
                }
                this.SendEvent(new EarthquakesChipClaimSuccessEvent(res));
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[ClaimEarthquakesChipRewardCommand] {0}", msg);
                this.SendEvent(new EarthquakesChipClaimFailedEvent(msg));
            });
    }
}

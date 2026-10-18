import { AbstractCommand } from "../../framework/QFramework";
import { SubGameId } from "../config/BundleManifest";
import { AppBootstrapModel } from "../model/AppBootstrapModel";
import { GameplayContextModel } from "../model/GameplayContextModel";
import { BundleSystem } from "../system/BundleSystem";

export class LeaveSubGameCommand extends AbstractCommand {
    protected OnExecute(): void {
        const subGameId = this.GetModel(GameplayContextModel).subGameId;
        void this.captureBackToHallVid(subGameId).then(() => {
            const leave = () => {
                void this.runLeaveWithOptionalDelay().then(() =>
                    this.GetSystem(BundleSystem).leaveGame().catch(() => {
                        /* errors logged in BundleSystem */
                    }),
                );
            };
            if (subGameId === SubGameId.Cricket) {
                void import("../../../subpackage/games/bet/cricket/script/command/CricketLeaveCommand")
                    .then((mod) => {
                        this.SendCommand(new mod.CricketLeaveCommand());
                    })
                    .finally(leave);
                return;
            }
            if (subGameId === SubGameId.Rocket) {
                void import("../../../subpackage/games/bet/rocket/script/command/RocketLeaveCommand")
                    .then((mod) => {
                        this.SendCommand(new mod.RocketLeaveCommand());
                    })
                    .finally(leave);
                return;
            }
            if (subGameId === SubGameId.Sixpoint) {
                void import("../../../subpackage/games/bet/sixpoint/script/command/SixpointLeaveCommand")
                    .then((mod) => {
                        this.SendCommand(new mod.SixpointLeaveCommand());
                    })
                    .finally(leave);
                return;
            }
            if (subGameId === SubGameId.Rummy) {
                void import("../../../subpackage/games/poker/rummy/script/command/RummyLeaveCommand")
                    .then((mod) => {
                        this.SendCommand(new mod.RummyLeaveCommand());
                    })
                    .finally(leave);
                return;
            }
            leave();
        });
    }

    private async captureBackToHallVid(subGameId: SubGameId): Promise<void> {
        const ctx = this.GetModel(GameplayContextModel);
        if (subGameId === SubGameId.Rummy) {
            try {
                const sm = await import("../../../subpackage/games/poker/rummy/script/model/RummyModel");
                const model = this.GetModel(sm.RummyModel);
                ctx.backToHallVid = Number(model.vid ?? 0);
            } catch {
                ctx.backToHallVid = 0;
            }
            return;
        }
        ctx.backToHallVid = 0;
    }

    private async runLeaveWithOptionalDelay(): Promise<void> {
        const bootstrap = this.GetModel(AppBootstrapModel);
        const ms = bootstrap.transition.min_exit_game_ms ?? 0;
        if (ms <= 0) {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, ms));
    }
}

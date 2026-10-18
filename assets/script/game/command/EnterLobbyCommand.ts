import { AbstractCommand } from "../../framework/QFramework";
import { StartupSteps } from "../config/StartConfig";
import { StartupSystem } from "../system/StartupSystem";
import { BundleSystem } from "../system/BundleSystem";

export class EnterLobbyCommand extends AbstractCommand {
    protected OnExecute(): void {
        const startup = this.GetSystem(StartupSystem);
        startup.emitProgress(4, StartupSteps[4].start);
        void this.GetSystem(BundleSystem)
            .preloadLobby()
            .then(() => this.GetSystem(BundleSystem).goLobby())
            .then(() =>
                import("../../../subpackage/function/hall/lobby/script/LobbyModule").then((m) => {
                    m.ensureLobbyRegistered();
                }),
            )
            .then(() => startup.emitProgress(4, StartupSteps[4].end));
    }
}

import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { SubGameId } from "../../../../../script/game/config/BundleManifest";
import { AppBootstrapModel } from "../../../../../script/game/model/AppBootstrapModel";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import {
    TransitionLoadingTimeoutSec,
    TransitionMode,
} from "../config/TransitionConfig";
import { TransitionFailedEvent } from "../event/TransitionFailedEvent";
import { TransitionModel } from "../model/TransitionModel";
import { CompleteTransitionToLobbyCommand } from "./CompleteTransitionToLobbyCommand";
import { CompleteTransitionToLoginCommand } from "./CompleteTransitionToLoginCommand";
import { CompleteTransitionToSubGameCommand } from "./CompleteTransitionToSubGameCommand";

export class RunTransitionPipelineCommand extends AbstractCommand {
    protected OnExecute(): void {
        void this.runAsync();
    }

    private async runAsync(): Promise<void> {
        const model = this.GetModel(TransitionModel);
        const intent = model.intent;
        if (!intent) {
            LogKit.E("[RunTransitionPipeline] missing intent");
            model.running = false;
            return;
        }

        const bootstrap = this.GetModel(AppBootstrapModel);
        if (bootstrap.maintain?.msg && intent.mode === TransitionMode.ToLobby) {
            this.SendCommand(new CompleteTransitionToLoginCommand());
            return;
        }

        const ui = this.GetSystem(UISystem);
        const timeout =
            intent.mode === TransitionMode.ToLobby
                ? TransitionLoadingTimeoutSec.toLobby
                : intent.mode === TransitionMode.ToLogin
                  ? TransitionLoadingTimeoutSec.toLogin
                  : TransitionLoadingTimeoutSec.toSubGame;
        ui.showBlockingLoading(timeout);

        await this.delay(bootstrap.transition.min_hold_ms);

        try {
            if (intent.mode === TransitionMode.ToSubGame) {
                const subGameId = intent.subGameId ?? SubGameId.None;
                if (subGameId !== SubGameId.None) {
                    this.GetSystem(AudioSystem)
                        .preloadForSubGame(subGameId)
                        .catch(() => undefined);
                    const lobbyEntry = this.GetSystem(BundleSystem);
                    lobbyEntry.releaseBundle("lobby");
                }
                this.SendCommand(new CompleteTransitionToSubGameCommand(intent));
                return;
            }
            if (intent.mode === TransitionMode.ToLobby) {
                this.SendCommand(new CompleteTransitionToLobbyCommand(intent));
                return;
            }
            if (intent.mode === TransitionMode.ToLogin) {
                this.SendCommand(new CompleteTransitionToLoginCommand());
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            this.SendEvent(new TransitionFailedEvent(intent.mode, error));
            model.running = false;
            ui.hideBlockingLoading();
            if (bootstrap.maintain?.msg) {
                this.SendCommand(new CompleteTransitionToLoginCommand());
            } else if (intent.mode === TransitionMode.ToSubGame) {
                this.SendCommand(
                    new CompleteTransitionToLobbyCommand({
                        mode: TransitionMode.ToLobby,
                        backToHallVid: intent.backToHallVid ?? 0,
                    }),
                );
            }
        }
    }

    private delay(ms: number): Promise<void> {
        if (ms <= 0) {
            return Promise.resolve();
        }
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

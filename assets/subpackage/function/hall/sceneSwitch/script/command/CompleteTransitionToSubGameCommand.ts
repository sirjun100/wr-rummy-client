import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { SubGameId } from "../../../../../script/game/config/BundleManifest";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { TransitionMode } from "../config/TransitionConfig";
import type { TransitionIntent } from "../config/TransitionProtocol";
import { TransitionFailedEvent } from "../event/TransitionFailedEvent";
import { TransitionModel } from "../model/TransitionModel";
import { StartTransitionCommand } from "./StartTransitionCommand";

export class CompleteTransitionToSubGameCommand extends AbstractCommand {
    public constructor(private readonly intent: TransitionIntent) {
        super();
    }

    protected OnExecute(): void {
        const subGameId = this.intent.subGameId ?? SubGameId.None;
        if (subGameId === SubGameId.None) {
            this.GetModel(TransitionModel).running = false;
            this.GetSystem(UISystem).hideBlockingLoading();
            return;
        }
        void this.GetSystem(BundleSystem)
            .enterGameDirect(subGameId, this.intent.sceneNameOverride ?? null)
            .then(() => {
                const tm = this.GetModel(TransitionModel);
                tm.running = false;
                tm.intent = null;
                if (subGameId !== SubGameId.Rummy) {
                    this.GetSystem(UISystem).hideBlockingLoading();
                }
            })
            .catch((err) => {
                const error = err instanceof Error ? err : new Error(String(err));
                this.SendEvent(new TransitionFailedEvent(TransitionMode.ToSubGame, error));
                const tm = this.GetModel(TransitionModel);
                tm.running = false;
                tm.intent = null;
                this.SendCommand(
                    new StartTransitionCommand({
                        mode: TransitionMode.ToLobby,
                        backToHallVid: this.intent.backToHallVid ?? 0,
                    }),
                );
            });
    }
}

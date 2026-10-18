import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { SubGameId } from "../../../../../script/game/config/BundleManifest";
import { GameplayContextModel } from "../../../../../script/game/model/GameplayContextModel";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import type { TransitionIntent } from "../config/TransitionProtocol";
import { TransitionModel } from "../model/TransitionModel";

export class CompleteTransitionToLobbyCommand extends AbstractCommand {
    public constructor(private readonly intent: TransitionIntent) {
        super();
    }

    protected OnExecute(): void {
        const vid = this.intent.backToHallVid ?? this.GetModel(GameplayContextModel).backToHallVid ?? 0;
        const previousSubGame = this.intent.subGameId ?? SubGameId.None;
        this.GetModel(GameplayContextModel).reset();
        void this.GetSystem(BundleSystem)
            .goLobbyDirect()
            .then(() =>
                import("../../lobby/script/LobbyModule").then((m) => {
                    m.ensureLobbyRegistered();
                    m.onLobbyEnter(1, vid);
                }),
            )
            .then(() => {
                if (previousSubGame !== SubGameId.None) {
                    this.GetSystem(BundleSystem).releaseSubGameBundle(previousSubGame);
                }
                const tm = this.GetModel(TransitionModel);
                tm.running = false;
                tm.intent = null;
                this.GetSystem(UISystem).hideBlockingLoading();
            })
            .catch(() => {
                const tm = this.GetModel(TransitionModel);
                tm.running = false;
                tm.intent = null;
                this.GetSystem(UISystem).hideBlockingLoading();
            });
    }
}

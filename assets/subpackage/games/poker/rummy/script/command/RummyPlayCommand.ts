import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RummyPlayAction, RummyRoute } from "../config/RummyProtocol";
import { RummyModel } from "../model/RummyModel";
import { callRummy } from "../utility/RummyNetwork";
import { applyRummyRpcSideEffects } from "../utility/RummyRpcHelper";

export class RummyPlayCommand extends AbstractCommand {
    public constructor(
        private readonly action: RummyPlayAction,
        private readonly cardId = 0,
    ) {
        super();
    }

    protected OnExecute(): void {
        void (async () => {
            const model = this.GetModel(RummyModel);
            const body: Record<string, unknown> = { action: this.action };
            if (this.cardId > 0) {
                body.card_id = this.cardId;
            }
            if (this.action === "declare" && model.groups.length > 0) {
                body.groups = model.groups.map((g) => ({
                    kind: g.kind,
                    cards: g.cards,
                }));
            }
            const res = await callRummy(this.GetSystem(NetworkSystem), RummyRoute.Play, body);
            applyRummyRpcSideEffects(res);
        })();
    }
}

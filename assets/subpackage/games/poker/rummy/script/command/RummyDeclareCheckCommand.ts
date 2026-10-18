import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RummyRoute } from "../config/RummyProtocol";
import { RummyModel } from "../model/RummyModel";
import { callRummy } from "../utility/RummyNetwork";

export class RummyDeclareCheckCommand extends AbstractCommand {
    public constructor(private readonly cardId: number) {
        super();
    }

    protected OnExecute(): void {
        void (async () => {
            const model = this.GetModel(RummyModel);
            const res = await callRummy<{ ok?: boolean }>(this.GetSystem(NetworkSystem), RummyRoute.DeclareCheck, {
                action: "declare",
                card_id: this.cardId,
                groups: model.groups.map((g) => ({ kind: g.kind, cards: g.cards })),
            });
            if (!res.ok) {
                globalThis.wrUi?.showToast?.("Invalid declare");
            }
        })();
    }
}

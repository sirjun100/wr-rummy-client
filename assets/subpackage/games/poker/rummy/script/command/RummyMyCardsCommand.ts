import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RummyCardDto, RummyRoute } from "../config/RummyProtocol";
import { RummyHandCardsEvent } from "../event/RummyEvents";
import { RummyModel } from "../model/RummyModel";
import { callRummy } from "../utility/RummyNetwork";

export class RummyMyCardsCommand extends AbstractCommand {
    protected OnExecute(): void {
        void (async () => {
            const res = await callRummy<{ data: RummyCardDto[] }>(
                this.GetSystem(NetworkSystem),
                RummyRoute.MyCards,
                {},
            );
            const cards = res.data ?? [];
            this.GetModel(RummyModel).applyMyCards(cards);
            this.SendEvent(new RummyHandCardsEvent(cards));
        })();
    }
}

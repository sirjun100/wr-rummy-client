import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RummyRoute, RummyTablePushPayload } from "../config/RummyProtocol";
import { RummyGameLogic } from "../RummyGameLogic";

let unsubTable: (() => void) | null = null;
let unsubCards: (() => void) | null = null;

export class RummySubscribePushCommand extends AbstractCommand {
    protected OnExecute(): void {
        unsubTable?.();
        unsubCards?.();
        const net = this.GetSystem(NetworkSystem);
        unsubTable = net.addRoomPushListener(RummyRoute.TablePush, (raw) => {
            RummyGameLogic.handlePush(raw as RummyTablePushPayload);
        });
        unsubCards = net.addRoomPushListener(RummyRoute.MyCards, (raw) => {
            RummyGameLogic.handlePush({ ...(raw as RummyTablePushPayload), kind: "my_cards" });
        });
    }
}

export function unsubscribeRummyPush(): void {
    unsubTable?.();
    unsubCards?.();
    unsubTable = null;
    unsubCards = null;
}

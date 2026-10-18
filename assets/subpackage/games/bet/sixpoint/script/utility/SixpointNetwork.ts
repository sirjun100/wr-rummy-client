import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { SixpointRes } from "../config/SixpointProtocol";

export async function callSixpoint<T>(
    net: NetworkSystem,
    route: number,
    body: object = {},
): Promise<SixpointRes<T>> {
    return net.callBet<SixpointRes<T>>(route, body);
}

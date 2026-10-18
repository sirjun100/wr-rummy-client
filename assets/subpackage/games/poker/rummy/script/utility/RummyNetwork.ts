import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RummyRes } from "../config/RummyProtocol";

export async function callRummy<T>(
    net: NetworkSystem,
    route: number,
    body: object = {},
): Promise<RummyRes<T>> {
    return net.callRoom<RummyRes<T>>(route, body);
}

export async function callLobbyMatch<T>(
    net: NetworkSystem,
    route: number,
    body: object = {},
): Promise<RummyRes<T>> {
    return net.callLobby<RummyRes<T>>(route, body);
}

import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RocketRes } from "../config/RocketProtocol";

export async function callCrash<T>(net: NetworkSystem, route: number, body: object = {}): Promise<RocketRes<T>> {
    return net.callBet<RocketRes<T>>(route, body);
}

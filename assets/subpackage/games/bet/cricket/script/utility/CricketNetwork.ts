import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { CricketRes } from "../config/CricketProtocol";

export async function callCricket<T>(net: NetworkSystem, route: number, body: object = {}): Promise<T> {
    const res = await net.callBet<CricketRes<T>>(route, body);
    return res.data as T;
}

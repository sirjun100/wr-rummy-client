import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RocketRoute, RocketPushPayload } from "../config/RocketProtocol";
import { RocketCrashPushEvent } from "../event/RocketEvents";

let unsub: (() => void) | null = null;

export class RocketSubscribePushCommand extends AbstractCommand {
    protected OnExecute(): void {
        if (unsub) {
            unsub();
        }
        unsub = this.GetSystem(NetworkSystem).addBetPushListener(RocketRoute.TablePush, (raw) => {
            const payload = raw as RocketPushPayload;
            this.SendEvent(new RocketCrashPushEvent(payload));
        });
    }
}

export function unsubscribeRocketPush(): void {
    unsub?.();
    unsub = null;
}

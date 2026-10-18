import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { SixpointRoute, SixpointPushPayload } from "../config/SixpointProtocol";
import { SixpointPushEvent } from "../event/SixpointEvents";

let unsub: (() => void) | null = null;

export class SixpointSubscribePushCommand extends AbstractCommand {
    protected OnExecute(): void {
        unsub?.();
        unsub = this.GetSystem(NetworkSystem).addBetPushListener(SixpointRoute.TablePush, (raw) => {
            this.SendEvent(new SixpointPushEvent(raw as SixpointPushPayload));
        });
    }
}

export function unsubscribeSixpointPush(): void {
    unsub?.();
    unsub = null;
}

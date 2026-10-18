import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { RummyCreateAndJoinCommand } from "./RummyCreateAndJoinCommand";
import { RummyMatchEnqueueCommand } from "./RummyMatchEnqueueCommand";

export class RummyEnterRoomCommand extends AbstractCommand {
    protected OnExecute(): void {
        void (async () => {
            if (globalThis.wrRummy?.useCreateRoom === true) {
                this.SendCommand(new RummyCreateAndJoinCommand());
                return;
            }
            const matched = await new Promise<boolean>((resolve) => {
                this.SendCommand(new RummyMatchEnqueueCommand(resolve));
            });
            if (!matched) {
                this.SendCommand(new RummyCreateAndJoinCommand());
            }
        })();
    }
}

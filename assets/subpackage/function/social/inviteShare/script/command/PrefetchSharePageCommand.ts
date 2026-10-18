import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { FetchSharePageCommand } from "./FetchSharePageCommand";

/** Delayed silent prefetch after entering hall (MainLobby.requestSharePageData parity). */
export class PrefetchSharePageCommand extends AbstractCommand {
    protected OnExecute(): void {
        setTimeout(() => {
            this.SendCommand(new FetchSharePageCommand(true));
        }, 1500);
    }
}

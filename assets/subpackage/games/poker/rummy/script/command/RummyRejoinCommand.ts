import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { RummySyncTableCommand } from "./RummySyncTableCommand";
import { RummyMyCardsCommand } from "./RummyMyCardsCommand";

/** Rejoin after disconnect: sync table + hand (no legacy 7070 WS). */
export class RummyRejoinCommand extends AbstractCommand {
    protected OnExecute(): void {
        this.SendCommand(new RummySyncTableCommand());
        this.SendCommand(new RummyMyCardsCommand());
    }
}

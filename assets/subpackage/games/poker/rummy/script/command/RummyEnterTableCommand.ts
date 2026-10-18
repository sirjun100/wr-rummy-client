import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { loadRummyMainTable } from "../utility/RummyTableLoader";
import { RummyJoinRoomCommand } from "./RummyJoinRoomCommand";

export class RummyEnterTableCommand extends AbstractCommand {
    public constructor(private readonly roomId: number) {
        super();
    }

    protected OnExecute(): void {
        void (async () => {
            await loadRummyMainTable();
            this.SendCommand(new RummyJoinRoomCommand(this.roomId));
        })();
    }
}

import { AbstractCommand } from "../../../../../script/framework/QFramework";
import type { HallPlayerDto } from "../../../../hall/hallMenu/script/config/HallConfig";
import { DeskStyleChangedEvent } from "../event/DeskStyleChangedEvent";
import { DeskStyleModel } from "../model/DeskStyleModel";

export class SyncDeskStyleFromHallCommand extends AbstractCommand {
    public constructor(private readonly player?: HallPlayerDto) {
        super();
    }

    protected OnExecute(): void {
        const model = this.GetModel(DeskStyleModel);
        const dto = this.player;
        if (!dto) {
            return;
        }
        const changed = model.applyServer(dto.table_id, dto.table_face_id, dto.table_back_id);
        if (changed) {
            model.persistLocal();
            this.SendEvent(new DeskStyleChangedEvent());
        }
    }
}

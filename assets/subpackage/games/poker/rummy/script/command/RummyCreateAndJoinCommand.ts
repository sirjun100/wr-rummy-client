import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { GameplayContextModel } from "../../../../../../script/game/model/GameplayContextModel";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RummyCreateRoomData, RummyRoute } from "../config/RummyProtocol";
import { RummyModel } from "../model/RummyModel";
import { callRummy } from "../utility/RummyNetwork";
import { RummyEnterTableCommand } from "./RummyEnterTableCommand";

export class RummyCreateAndJoinCommand extends AbstractCommand {
    protected OnExecute(): void {
        void (async () => {
            const model = this.GetModel(RummyModel);
            const templateId = model.templateId || this.GetModel(GameplayContextModel).templateId || "points_10";
            const res = await callRummy<{ data: RummyCreateRoomData }>(this.GetSystem(NetworkSystem), RummyRoute.CreateRoom, {
                name: "table",
                template_id: templateId,
            });
            const roomId = res.data?.room_id ?? 0;
            if (roomId <= 0) {
                globalThis.wrUi?.showToast?.("Create room failed");
                return;
            }
            this.SendCommand(new RummyEnterTableCommand(roomId));
        })();
    }
}

import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { GameplayContextModel } from "../../../../../../script/game/model/GameplayContextModel";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RummyPublicView, RummyRoute } from "../config/RummyProtocol";
import { RummyModel } from "../model/RummyModel";
import { callRummy } from "../utility/RummyNetwork";

export class RummySyncTableCommand extends AbstractCommand {
    protected OnExecute(): void {
        void (async () => {
            const res = await callRummy<{ data: RummyPublicView }>(
                this.GetSystem(NetworkSystem),
                RummyRoute.SyncRoom,
                {},
            );
            const model = this.GetModel(RummyModel);
            if (res.data) {
                model.applyPush(res.data);
                const ctx = this.GetModel(GameplayContextModel);
                ctx.roomId = String(res.data.room_id);
                ctx.tidKey = model.tidKey;
            }
        })();
    }
}

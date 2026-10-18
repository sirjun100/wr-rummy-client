import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { GameplayContextModel } from "../../../../../../script/game/model/GameplayContextModel";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { RummyRoute } from "../config/RummyProtocol";
import { RummyModel } from "../model/RummyModel";
import { callRummy } from "../utility/RummyNetwork";
import { RummyMyCardsCommand } from "./RummyMyCardsCommand";
import { RummySyncTableCommand } from "./RummySyncTableCommand";

export class RummyJoinRoomCommand extends AbstractCommand {
    public constructor(private readonly roomId: number) {
        super();
    }

    protected OnExecute(): void {
        void (async () => {
            await callRummy(this.GetSystem(NetworkSystem), RummyRoute.JoinRoom, {
                room_id: this.roomId,
            });
            const model = this.GetModel(RummyModel);
            model.roomId = this.roomId;
            model.tidKey = `rummy_${this.roomId}`;
            const ctx = this.GetModel(GameplayContextModel);
            ctx.roomId = String(this.roomId);
            ctx.tidKey = model.tidKey;
            this.SendCommand(new RummySyncTableCommand());
            this.SendCommand(new RummyMyCardsCommand());
        })();
    }
}

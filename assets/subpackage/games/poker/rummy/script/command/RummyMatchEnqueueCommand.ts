import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { GameplayContextModel } from "../../../../../../script/game/model/GameplayContextModel";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { MatchRoute, RummyMatchStatusData } from "../config/RummyProtocol";
import { RummyModel } from "../model/RummyModel";
import { callLobbyMatch } from "../utility/RummyNetwork";
import { RummyEnterTableCommand } from "./RummyEnterTableCommand";

const GAME_ID = "card.rummy";
const MAX_POLLS = 24;

export class RummyMatchEnqueueCommand extends AbstractCommand {
    public constructor(private readonly onDone?: (matched: boolean) => void) {
        super();
    }

    protected OnExecute(): void {
        void (async () => {
            const model = this.GetModel(RummyModel);
            const ctx = this.GetModel(GameplayContextModel);
            const templateId = model.templateId || ctx.templateId || "points_10";
            const net = this.GetSystem(NetworkSystem);
            try {
                await callLobbyMatch(net, MatchRoute.Enqueue, {
                    game_id: GAME_ID,
                    template_id: templateId,
                });
            } catch {
                this.onDone?.(false);
                return;
            }
            for (let i = 0; i < MAX_POLLS; i++) {
                await new Promise((r) => setTimeout(r, 500));
                const st = await callLobbyMatch<{ data: RummyMatchStatusData }>(net, MatchRoute.Status, {});
                const status = st.data?.status ?? "";
                const tableId = st.data?.table_id ?? 0;
                if (status === "matched" && tableId > 0) {
                    this.SendCommand(new RummyEnterTableCommand(tableId));
                    this.onDone?.(true);
                    return;
                }
            }
            this.onDone?.(false);
        })();
    }
}

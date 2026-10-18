import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { openSixpointDialog } from "../SixpointGameModule";
import { SixpointRoute } from "../config/SixpointProtocol";
import { SixpointNoseatPlayersDialog } from "../ui/dialogs/SixpointNoseatPlayersDialog";
import { callSixpoint } from "../utility/SixpointNetwork";

export class SixpointPlayersPageCommand extends AbstractCommand {
    public constructor(private readonly page: number = 1) {
        super();
    }

    protected OnExecute(): void {
        void callSixpoint<{
            page?: number;
            total?: number;
            players?: { name?: string; money?: number }[];
        }>(this.GetSystem(NetworkSystem), SixpointRoute.PlayersPage, {
            page: this.page,
        }).then(async (res) => {
            const data = res.data ?? {};
            const dlg = await openSixpointDialog(
                SixpointNoseatPlayersDialog,
                "SixpointNoseatPlayersDialog",
                "players",
            );
            dlg?.refreshUI({
                page: data.page ?? this.page,
                total: data.total ?? 1,
                players: data.players ?? [],
            });
        });
    }
}

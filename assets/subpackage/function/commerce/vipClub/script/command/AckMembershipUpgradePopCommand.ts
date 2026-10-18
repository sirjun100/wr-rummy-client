import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { MembershipRoute } from "../config/MembershipConfig";

export class AckMembershipUpgradePopCommand extends AbstractCommand {
    private readonly scene: string;

    public constructor(scene: "hall" | "game" = "hall") {
        super();
        this.scene = scene;
    }

    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem).callLobby(MembershipRoute.UpgradePopAck, { scene: this.scene });
    }
}

import { AbstractModel } from "../../framework/QFramework";
import { SubGameId } from "../config/BundleManifest";

export class GameplayContextModel extends AbstractModel {
    public subGameId: SubGameId = SubGameId.None;
    public tableId: string = "";
    public roomId: string = "";
    public templateId: string = "";
    public tidKey: string = "";
    /** Passed to lobby 1025 when returning from a sub-game. */
    public backToHallVid = 0;

    protected OnInit(): void {}

    public reset(): void {
        this.subGameId = SubGameId.None;
        this.tableId = "";
        this.roomId = "";
        this.templateId = "";
        this.tidKey = "";
        this.backToHallVid = 0;
    }
}

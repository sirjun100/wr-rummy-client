import { AbstractModel } from "../../framework/QFramework";
import { SubGameId } from "../config/BundleManifest";

export class GameplayContextModel extends AbstractModel {
    public subGameId: SubGameId = SubGameId.None;
    public tableId: string = "";
    public roomId: string = "";

    protected OnInit(): void {}

    public reset(): void {
        this.subGameId = SubGameId.None;
        this.tableId = "";
        this.roomId = "";
    }
}

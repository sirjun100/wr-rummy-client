import { Label, Node } from "cc";
import { findDeep } from "../utility/SelectionVenueUiHelper";
import type { RoomCatalogEntryDto } from "../config/SelectionVenueProtocol";

export class RoomEntryInfoBinder {
    public constructor(private readonly roomInfo: Node | null) {}

    public apply(entry: RoomCatalogEntryDto | null): void {
        if (!this.roomInfo || !entry) {
            return;
        }
        const points = findDeep(this.roomInfo, "value");
        const feeLabels = ["fee", "points"];
        for (const name of feeLabels) {
            const n = findDeep(this.roomInfo, name);
            const lab = n?.getComponent(Label);
            if (lab && name === "points") {
                lab.string = String(entry.boot ?? 0);
            }
            if (lab && name === "fee") {
                lab.string = String(entry.entry ?? 0);
            }
        }
        const entryInfo = findDeep(this.roomInfo, "entry_info") ?? this.roomInfo;
        const feeNode = findDeep(entryInfo, "fee");
        feeNode?.getComponent(Label) && (feeNode.getComponent(Label)!.string = String(entry.entry ?? 0));
        const pv = findDeep(entryInfo, "points")?.getChildByName("value");
        pv?.getComponent(Label) && (pv.getComponent(Label)!.string = String(entry.boot ?? 0));
    }
}

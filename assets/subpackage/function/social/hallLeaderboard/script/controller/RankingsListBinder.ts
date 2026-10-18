import { instantiate, Node, ScrollView } from "cc";
import type { RankRowDto } from "../config/RankingsProtocol";
import { bindRankRow, findDeep } from "../utility/RankingsUiHelper";

export class RankingsListBinder {
    public constructor(
        private readonly scrollRoot: Node | null,
        private readonly itemTemplate: Node | null,
    ) {}

    public render(rows: RankRowDto[]): void {
        const sv = this.scrollRoot?.getComponent(ScrollView);
        const content = sv?.content ?? findDeep(this.scrollRoot, "content");
        const template = this.itemTemplate;
        if (!content || !template) {
            return;
        }
        content.removeAllChildren();
        template.active = false;
        for (let i = 0; i < rows.length; i++) {
            const item = instantiate(template);
            item.active = true;
            bindRankRow(item, rows[i], i === 0 && rows[i].is_me === 1);
            content.addChild(item);
        }
        const nodata = findDeep(this.scrollRoot, "nodata");
        if (nodata) {
            nodata.active = rows.length === 0;
        }
    }
}

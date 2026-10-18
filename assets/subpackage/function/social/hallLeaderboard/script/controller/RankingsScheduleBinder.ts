import { instantiate, Label, Node, ScrollView } from "cc";
import type { HallScheduleDto } from "../config/RankingsProtocol";
import { findDeep, setLabel } from "../utility/RankingsUiHelper";

export class RankingsScheduleBinder {
    public constructor(
        private readonly panel: Node | null,
        private readonly itemTemplate: Node | null,
    ) {}

    public apply(data: HallScheduleDto): void {
        if (!this.panel) {
            return;
        }
        setLabel(findDeep(this.panel, "title"), data.top_tips ?? "");
        setLabel(findDeep(this.panel, "date"), `${data.start_day ?? ""} to ${data.end_day ?? ""}`);
        setLabel(findDeep(this.panel, "total"), data.total_reward ? `Total Prize: ${data.total_reward}` : "");
        const svNode = findDeep(this.panel, "ScrollView");
        const content = svNode?.getComponent(ScrollView)?.content ?? findDeep(this.panel, "content");
        const tpl = this.itemTemplate;
        if (!content || !tpl) {
            return;
        }
        content.removeAllChildren();
        tpl.active = false;
        const list = data.schedule ?? [];
        for (const row of list) {
            const item = instantiate(tpl);
            item.active = true;
            setLabel(findDeep(item, "wz") ?? findDeep(item, "day"), row.day ?? "");
            setLabel(findDeep(item, "num") ?? findDeep(item, "time"), row.time ?? row.reward ?? "");
            content.addChild(item);
        }
        const rewards = data.reward_list ?? [];
        for (const row of rewards) {
            const item = instantiate(tpl);
            item.active = true;
            setLabel(findDeep(item, "wz"), row.show_range_time ?? "");
            const num = findDeep(item, "num");
            if (num) {
                const lb = num.getComponent(Label);
                if (lb) {
                    lb.string = row.total_reward ?? "";
                }
            }
            content.addChild(item);
        }
    }
}

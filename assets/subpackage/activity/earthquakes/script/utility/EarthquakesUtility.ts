import { instantiate, Label, Node, ScrollView, size, UIOpacity, UITransform, v3 } from "cc";
import { IUtility } from "../../../../../script/framework/QFramework";
import {
    EarthquakesPageDto,
    EarthquakesRankDto,
    EarthquakesTaskItemDto,
    EarthquakesTaskDto,
    EarthquakesVidRoomDto,
} from "../config/EarthquakesConfig";

/** 寻宝子包：任务/排行列表绑定与 ScrollView 布局（QFramework IUtility，在 ensureEarthquakesRegistered 注册）。 */
export class EarthquakesUtility implements IUtility {
    public taskMapKey(vid: number, player: number): string {
        return `${vid}_${player}`;
    }

    public resortTaskList(list: EarthquakesTaskItemDto[], inHall: boolean): EarthquakesTaskItemDto[] {
        const copy = [...list];
        copy.sort((a, b) => (inHall ? (a.st ?? 0) - (b.st ?? 0) : (b.st ?? 0) - (a.st ?? 0)));
        return copy;
    }

    public pickRoomList(page: EarthquakesPageDto, player: number, pointsMode: number): EarthquakesVidRoomDto[] {
        const pool = pointsMode === 2;
        const deals = pointsMode === 3;
        if (pool) {
            return player === 2 ? page.pool_p2 ?? [] : page.pool_p6 ?? [];
        }
        if (deals) {
            return player === 2 ? page.deals_p2 ?? [] : page.deals_p6 ?? [];
        }
        return player === 2 ? page.p2 ?? [] : page.p6 ?? [];
    }

    public renderHallTaskList(
        taskNode: Node,
        taskMoban: Node,
        task: EarthquakesTaskDto,
        cache: Node[],
    ): Node[] {
        const scroll = taskNode.getChildByName("taskList")?.getComponent(ScrollView);
        const content = scroll?.content;
        if (!content || !taskMoban || !task.list?.length) {
            return cache;
        }
        content.removeAllChildren();
        const list = this.resortTaskList(task.list, true);
        const h = taskMoban.getComponent(UITransform)?.contentSize.height ?? 120;
        let y = 0;
        const gap = 4;
        const items: Node[] = [];
        for (let i = 0; i < list.length; i++) {
            let row = cache[i];
            if (!row) {
                row = instantiate(taskMoban);
                cache[i] = row;
            }
            row.active = true;
            row.setPosition(v3(0, y));
            content.addChild(row);
            this.bindTaskItem(row, list[i], true);
            items.push(row);
            y -= h + gap;
        }
        const w = content.getComponent(UITransform)?.contentSize.width ?? 600;
        content.getComponent(UITransform)?.setContentSize(size(w, h * list.length + gap * (list.length - 1)));
        scroll.scrollToTop(0);
        const today = taskNode.getChildByName("today_game")?.getComponent(Label);
        if (today) {
            today.string = `Today's games:${task.cju ?? 0}/${task.tju ?? 0}`;
            today.node.active = true;
        }
        return items;
    }

    public renderGameTaskList(
        taskNode: Node,
        taskMoban: Node,
        task: EarthquakesTaskDto,
        cache: Node[],
    ): Node[] {
        const scroll = taskNode.getChildByName("taskList")?.getComponent(ScrollView);
        const content = scroll?.content;
        if (!content || !taskMoban || !task.list?.length) {
            return cache;
        }
        content.removeAllChildren();
        const list = this.resortTaskList(task.list, false);
        const w = taskMoban.getComponent(UITransform)?.contentSize.width ?? 157;
        const gap = 6;
        let x = 0;
        const items: Node[] = [];
        for (let i = 0; i < list.length; i++) {
            let row = cache[i];
            if (!row) {
                row = instantiate(taskMoban);
                cache[i] = row;
            }
            row.active = true;
            row.setPosition(v3(x, 0));
            content.addChild(row);
            this.bindTaskItem(row, list[i], false);
            items.push(row);
            x += w + gap;
        }
        content.getComponent(UITransform)?.setContentSize(size(x - gap, 256));
        const today = taskNode.getChildByName("today_game")?.getComponent(Label);
        if (today) {
            today.string = `Today's games:${task.cju ?? 0}/${task.tju ?? 0}`;
            today.node.active = true;
            if ((task.cju ?? 0) > (task.tju ?? 0)) {
                today.string = "Come back tomorrow";
            }
        }
        return items;
    }

    public renderRankList(rankNode: Node, rankMoban: Node, rank: EarthquakesRankDto): void {
        const listRoot = rankNode.getChildByName("rankList") ?? rankNode;
        const scroll = listRoot.getComponent(ScrollView);
        const content = scroll?.content ?? listRoot;
        if (!rankMoban) {
            return;
        }
        content.removeAllChildren();
        const list = rank.rank_list ?? [];
        const h = rankMoban.getComponent(UITransform)?.contentSize.height ?? 80;
        let y = 0;
        for (let i = 0; i < list.length; i++) {
            const row = instantiate(rankMoban);
            row.active = true;
            row.setPosition(v3(0, y));
            content.addChild(row);
            const entry = list[i];
            const rankLbl = row.getChildByName("rank")?.getComponent(Label);
            if (rankLbl) {
                rankLbl.string = String(entry.rank ?? i + 1);
            }
            const nameLbl = row.getChildByName("name")?.getComponent(Label);
            if (nameLbl) {
                nameLbl.string = entry.name ?? "";
            }
            const scoreLbl = row.getChildByName("score")?.getComponent(Label);
            if (scoreLbl) {
                scoreLbl.string = String(entry.score ?? 0);
            }
            y -= h;
        }
    }

    private bindTaskItem(node: Node, item: EarthquakesTaskItemDto, inHall: boolean): void {
        const wz = node.getChildByName("wz")?.getComponent(Label);
        if (wz && item.tc) {
            wz.string = item.tc;
        }
        const opacity = node.getComponent(UIOpacity);
        if (opacity) {
            opacity.opacity = item.st === 1 ? 127.5 : 255;
        }
        const rewards = item.reward ?? [];
        const item0 = node.getChildByName("reward")?.getChildByName("item0");
        const item1 = node.getChildByName("reward")?.getChildByName("item1");
        if (item0) {
            item0.active = false;
        }
        if (item1) {
            item1.active = false;
        }
        for (const r of rewards) {
            const t = Number(r.type ?? -1);
            if (t === 0 && item0) {
                item0.active = true;
                const num = item0.getChildByName("num")?.getComponent(Label);
                if (num) {
                    num.string = r.amt ?? String(r.num ?? "");
                }
                const gou = item0.getChildByName("gou");
                if (gou) {
                    gou.active = item.st === 1;
                }
            } else if (t === 1 && item1) {
                item1.active = true;
                const num = item1.getChildByName("num")?.getComponent(Label);
                if (num) {
                    num.string = r.amt ?? String(r.num ?? "");
                }
                const gou = item1.getChildByName("gou");
                if (gou) {
                    gou.active = item.st === 1;
                }
            }
        }
        if (!inHall) {
            const gou0 = node.getChildByName("gou0");
            if (gou0) {
                gou0.active = item.st === 1;
            }
        }
    }
}

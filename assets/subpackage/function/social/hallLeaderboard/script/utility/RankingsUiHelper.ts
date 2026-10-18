import { Label, Node } from "cc";
import type { RankRowDto } from "../config/RankingsProtocol";
export function formatCountdown(sec: number): string {
    if (sec <= 0) {
        return "";
    }
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

export function findDeep(root: Node | null, name: string): Node | null {
    if (!root) {
        return null;
    }
    if (root.name === name) {
        return root;
    }
    for (const child of root.children) {
        const hit = findDeep(child, name);
        if (hit) {
            return hit;
        }
    }
    return null;
}

export function setLabel(node: Node | null, text: string): void {
    if (!node) {
        return;
    }
    const label = node.getComponent(Label);
    if (label) {
        label.string = text;
    }
}

export function bindRankRow(item: Node, row: RankRowDto, isSticky = false): void {
    const rank = row.rank ?? 0;
    const rankSp = findDeep(item, "rank_sp");
    const num = findDeep(item, "num") ?? findDeep(item, "rank");
    if (rank > 0 && rank <= 3 && rankSp) {
        rankSp.active = true;
        if (num) {
            num.active = false;
        }
    } else if (num) {
        num.active = true;
        setLabel(num, rank > 0 ? String(rank) : "-");
        if (rankSp) {
            rankSp.active = false;
        }
    }
    setLabel(findDeep(item, "name"), row.name ?? "");
    setLabel(findDeep(item, "score") ?? findDeep(item, "points"), row.points != null ? String(row.points) : "");
    const cash = findDeep(item, "cash");
    if (cash) {
        const prizeNum = findDeep(cash, "num");
        setLabel(prizeNum ?? cash, row.bmoney ? `₹${row.bmoney}` : "");
        cash.active = Boolean(row.bmoney);
    }
    const prizeNode = findDeep(item, "prize_node");
    if (prizeNode && row.bmoney) {
        setLabel(findDeep(prizeNode, "num"), row.bmoney);
    }
    if (isSticky || row.is_me === 1) {
        item.name = item.name || "rank_item";
    }
}

export function formatPrize(amount: string | undefined): string {
    if (!amount) {
        return "";
    }
    return amount;
}

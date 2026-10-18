import { color, Label, Node, Sprite } from "cc";
import type { RankRowDto } from "../config/GameActLeaderboardProtocol";

export function formatCountdown(sec: number): string {
    const s = Math.max(0, Math.floor(sec));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(h)}:${pad(m)}:${pad(r)}`;
}

export function bindRankRow(node: Node, row: RankRowDto, index: number): void {
    const bg = node.getChildByName("bg");
    const rankLbl = node.getChildByName("rank")?.getComponent(Label);
    const nameLbl = node.getChildByName("name")?.getComponent(Label);
    const scoreLbl = node.getChildByName("score")?.getComponent(Label);
    const rewardLbl = node.getChildByName("reward")?.getComponent(Label);
    const isMe = Number(row.is_me ?? 0) === 1;
    if (bg) {
        const sp = bg.getComponent(Sprite);
        if (sp) {
            sp.color = index === 0 || isMe ? color(251, 245, 225) : color(240, 240, 240);
        }
    }
    if (rankLbl) {
        rankLbl.string = row.rank != null && row.rank > 0 ? String(row.rank) : "-";
    }
    if (nameLbl) {
        nameLbl.string = isMe ? "Me" : String(row.name ?? "");
    }
    if (scoreLbl) {
        scoreLbl.string = String(row.points ?? 0);
    }
    if (rewardLbl) {
        rewardLbl.string = row.bmoney ? `₹${row.bmoney}` : "";
    }
    const upRoot = node.getChildByName("rank")?.getChildByName("up_root");
    if (upRoot) {
        upRoot.active = index === 0 && Number(row.up_rank ?? 0) > 0;
        const upLbl = upRoot.getChildByName("name")?.getComponent(Label);
        if (upLbl && row.up_rank) {
            upLbl.string = String(row.up_rank);
        }
    }
}

import {
    instantiate,
    Label,
    Layout,
    Node,
    ProgressBar,
    ScrollView,
    size,
    Sprite,
    SpriteFrame,
    UITransform,
    v3,
} from "cc";
import type { ClubPageDto, ClubTierDto, PlayerClubDto } from "../config/MembershipProtocol";
import { gradeByClubLevel } from "./MembershipGradeUtil";
import { Utility } from "../../../../../script/game/utility/Utility";

type BinderHost = {
    degreeMoban0: Node;
    degreeMoban1: Node;
    clubDegreeIcos: SpriteFrame[];
    scrollView: ScrollView;
    node: Node;
};

export class MembershipDegreeScrollBinder {
    private degreeItems: Node[] = [];
    private hasInit = false;
    private tickNodes: Node[] = [];

    public constructor(private readonly host: BinderHost) {}

    public dispose(): void {
        for (const n of this.tickNodes) {
            n.destroy();
        }
        this.tickNodes = [];
    }

    public applyPage(page: ClubPageDto): void {
        if (!page.list?.length || !page.player_club_info) {
            return;
        }
        if (!this.hasInit) {
            this.createDegreeItems(page.list);
            this.hasInit = true;
        }
        const pc = page.player_club_info;
        const grade = gradeByClubLevel(pc.club_level ?? 0);
        for (let t = 0; t < this.degreeItems.length; t++) {
            const item = this.degreeItems[t];
            if (!item) {
                continue;
            }
            let tier: ClubTierDto;
            if (t === 0) {
                const a = page.list[0];
                tier = { init_score: 0, full_score: a?.init_score ?? 0 };
            } else {
                tier = page.list[t - 1] ?? {};
            }
            this.refreshDegreeItem(item, t, tier, pc, grade);
        }
        this.scrollToGrade(grade);
    }

    private createDegreeItems(list: ClubTierDto[]): void {
        const content = this.host.scrollView?.content;
        if (!content || !this.host.degreeMoban1 || !this.host.degreeMoban0) {
            return;
        }
        this.degreeItems = [];
        for (let t = list.length - 1; t >= 0; t--) {
            const e = instantiate(this.host.degreeMoban1);
            e.name = `degree_node${t + 1}`;
            e.active = true;
            this.degreeItems.push(e);
            content.addChild(e);
        }
        const bottom = instantiate(this.host.degreeMoban0);
        bottom.name = "degree_node0";
        bottom.active = true;
        this.degreeItems.push(bottom);
        content.addChild(bottom);
        this.degreeItems.reverse();
        this.host.degreeMoban0.active = false;
        this.host.degreeMoban1.active = false;
    }

    private refreshDegreeItem(
        e: Node,
        t: number,
        tier: ClubTierDto,
        pc: PlayerClubDto,
        grade: number,
    ): void {
        const safety = e.getChildByName("safety_node");
        const bar = e.getChildByName("ProgressBar");
        const barInner = bar?.getChildByName("Bar");
        const floatBg = barInner?.getChildByName("float_bg");
        const resetBg = e.getChildByName("reset_bg");
        const resetTime = e.getChildByName("reset_time");

        if (safety) {
            safety.active = grade === t && t !== 0;
        }
        if (floatBg) {
            floatBg.active = grade === t;
        }
        if (resetBg) {
            resetBg.active = grade === t && t !== 0;
        }
        if (resetTime) {
            resetTime.active = grade === t && t !== 0;
        }

        const s = Number(tier.init_score ?? 0);
        const o = Number(tier.full_score ?? 0);
        const pb = bar?.getComponent(ProgressBar);

        if (grade === t) {
            const score = Number(pc.club_score ?? 0);
            let r = o > s ? (score - s) / (o - s) : 0;
            if (safety && tier.protect_score !== undefined) {
                const pointLab = safety.getChildByName("point")?.getComponent(Label);
                if (pointLab) {
                    pointLab.string = String(tier.protect_score);
                }
                const n = o > s ? (Number(tier.protect_score) - s) / (o - s) : 0;
                const h = t > 0 ? 848 : 400;
                safety.setPosition(v3(-184.939, h * n));
            }
            if (pb) {
                pb.progress = Math.min(1, Math.max(0, r));
            }
            const lpLab = floatBg?.getChildByName("lp_score")?.getComponent(Label);
            if (lpLab) {
                lpLab.string = String(Math.floor(score));
            }
            if (resetTime) {
                const left = Number(pc.left_second ?? 0);
                resetTime.getComponent(Label)!.string = Utility.time.durationShort(left);
                const w = resetTime.getComponent(UITransform)?.contentSize.width ?? 0;
                const sx = resetTime.scale.x;
                resetBg?.getComponent(UITransform)?.setContentSize(size(w * sx + 15, 38));
            }
        } else if (pb) {
            pb.progress = grade > t ? 1 : 0;
        }

        const ico = e.getChildByName("ico")?.getComponent(Sprite);
        if (ico && this.host.clubDegreeIcos[t]) {
            ico.spriteFrame = this.host.clubDegreeIcos[t];
        }
        const ico1 = e.getChildByName("ico1")?.getComponent(Sprite);
        if (ico1) {
            if (t + 1 <= 9 && this.host.clubDegreeIcos[t + 1]) {
                ico1.spriteFrame = this.host.clubDegreeIcos[t + 1];
                ico1.node.active = true;
            } else {
                ico1.node.active = false;
            }
        }

        if (t > 0) {
            const degreeScore = e.getChildByName("degree_score")?.getComponent(Label);
            if (degreeScore) {
                degreeScore.string = String(s);
            }
            const bigIco = e.getChildByName("big_ico")?.getComponent(Sprite);
            if (bigIco && this.host.clubDegreeIcos[t]) {
                bigIco.spriteFrame = this.host.clubDegreeIcos[t];
            }
            const nameLab = e.getChildByName("club_name")?.getComponent(Label);
            const bigName = e.getChildByName("big_club_name")?.getComponent(Label);
            if (tier.name) {
                if (nameLab) {
                    nameLab.string = tier.name;
                }
                if (bigName) {
                    bigName.string = tier.name;
                }
            }
            this.bindGiftNode(e, tier);
        }
    }

    private bindGiftNode(e: Node, tier: ClubTierDto): void {
        const o = e.getChildByName("gift_node");
        if (!o) {
            return;
        }
        this.bindRewardPair(o, "up_gift", tier.upgrade_cash, tier.upgrade_bonus);
        this.bindRewardPair(o, "week_gift", tier.week_cash, tier.week_bonus);
        this.bindRewardPair(o, "month_gift", tier.month_cash, tier.month_bonus);
        const coupon = o.getChildByName("coupon_gitt");
        if (coupon) {
            const ratio = tier.month_coupon_ratio ?? "";
            coupon.active = ratio.length > 0;
            const amt = coupon.getChildByName("reward")?.getChildByName("amt")?.getComponent(Label);
            if (amt && ratio) {
                amt.string = ratio;
            }
            coupon.getChildByName("reward")?.getComponent(Layout)?.updateLayout();
        }
        const svc = o.getChildByName("service_gift");
        if (svc) {
            svc.active = (tier.specialized_cs ?? 0) === 1;
        }
        const txCount = o.getChildByName("withdraw_count");
        if (txCount) {
            const c = Number(tier.tx_count ?? 0);
            txCount.active = c > 0;
            const tip = txCount.getChildByName("tip")?.getComponent(Label);
            if (tip) {
                tip.string = String(c);
            }
        }
        const daily = o.getChildByName("daily_withdraw");
        if (daily) {
            const lim = Number(tier.tx_limit ?? 0);
            daily.active = lim > 0;
            const tip = daily.getChildByName("tip")?.getComponent(Label);
            if (tip) {
                tip.string = String(lim);
            }
        }
    }

    private bindRewardPair(root: Node, childName: string, cash?: number, bonus?: number): void {
        const node = root.getChildByName(childName);
        if (!node) {
            return;
        }
        const a = Number(cash ?? 0);
        const l = Number(bonus ?? 0);
        if (a === 0 && l === 0) {
            node.active = false;
            return;
        }
        node.active = true;
        const reward = node.getChildByName("reward");
        if (!reward) {
            return;
        }
        const itemCash = reward.getChildByName("item_cash");
        const itemBonus = reward.getChildByName("item_bonus");
        const add = reward.getChildByName("add");
        if (itemCash) {
            itemCash.active = a > 0;
            const amt = itemCash.getChildByName("amt")?.getComponent(Label);
            if (amt) {
                amt.string = String(a);
            }
            itemCash.getComponent(Layout)?.updateLayout();
        }
        if (itemBonus) {
            itemBonus.active = l > 0;
            const amt = itemBonus.getChildByName("amt")?.getComponent(Label);
            if (amt) {
                amt.string = String(l);
            }
            itemBonus.getComponent(Layout)?.updateLayout();
        }
        if (add) {
            add.active = l > 0 && a > 0;
        }
        reward.getComponent(Layout)?.updateLayout();
    }

    private scrollToGrade(grade: number): void {
        const sv = this.host.scrollView;
        if (!sv) {
            return;
        }
        const map: Record<number, number> = {
            0: 0,
            1: 0.03,
            2: 0.16,
            3: 0.268,
            4: 0.4,
            5: 0.52,
            6: 0.64,
            7: 0.76,
            8: 0.9,
        };
        if (grade === 0) {
            sv.scrollToBottom(0);
        } else if (map[grade] !== undefined) {
            sv.scrollToPercentVertical(map[grade], 0);
        } else {
            sv.scrollToTop(0);
        }
    }
}

import { GameApp } from "../../../../../script/game/GameApp";
import { PaymentModel } from "../../../../../script/game/commerce/model/PaymentModel";
import type { ClubPageDto, MembershipSummaryDto } from "../config/MembershipProtocol";
import { gradeByClubLevel } from "./MembershipGradeUtil";

export function summaryFromClubPage(page: ClubPageDto): MembershipSummaryDto {
    const pc = page.player_club_info ?? {};
    const level = gradeByClubLevel(pc.club_level ?? 0);
    const list = page.list ?? [];
    let tier = list[0];
    for (const row of list) {
        if (row.level_id === pc.club_level) {
            tier = row;
            break;
        }
    }
    const full = tier?.full_score ?? 0;
    const score = pc.club_score ?? 0;
    const next = full > score ? full - score : 0;
    return {
        level,
        withdraw_count: tier?.tx_count ?? 2,
        daily_withdraw: tier?.tx_limit ?? 3,
        next_level_need: next,
    };
}

export function syncPaymentMembershipSummary(page: ClubPageDto): void {
    const summary = summaryFromClubPage(page);
    GameApp.Interface.GetModel(PaymentModel).membershipPage.value = summary;
}

export function syncPaymentSummaryFromPlayerClub(pc: { club_level?: number }): void {
    const level = gradeByClubLevel(pc.club_level ?? 0);
    const cur = GameApp.Interface.GetModel(PaymentModel).membershipPage.value;
    GameApp.Interface.GetModel(PaymentModel).membershipPage.value = {
        ...cur,
        level,
    };
}

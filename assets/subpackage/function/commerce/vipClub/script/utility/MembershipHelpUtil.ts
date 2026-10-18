import type { ClubPageDto } from "../config/MembershipProtocol";

export function buildMembershipHelpText(page: ClubPageDto): string {
    if (page.help_cnt && page.help_cnt.length > 0) {
        return page.help_cnt;
    }
    const t = page.point_sp ?? "1";
    const i = page.pool_sp ?? "1.5";
    const a = page.deals_sp ?? "2.5";
    const l = page.cricket_sp ?? "4";
    return (
        `The CLUB system provides exclusive benefits to important players.\n\n` +
        `LP rates: Points ${t}, Pool ${i}, Deals ${a}, Cricket ${l} cash per 1 LP.\n\n` +
        `Validity: meet safety points to maintain level; otherwise level drops. ` +
        `Rewards include upgrade, weekly, monthly gifts and coupons.`
    );
}

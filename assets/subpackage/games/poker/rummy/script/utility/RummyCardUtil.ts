export type RummyCardInfo = {
    value: number;
    point: number;
    cardFen: number;
    color: number;
};

export type RummyPlayerShowcardInfo = {
    isfold?: number;
    showcard?: number | string;
};

/** Rummy 牌面编码与展示（迁移自 ToolUtils 牌相关方法）。 */
export class RummyCardUtil {
    public static CardToHexByte(card: number | null | undefined): string | undefined {
        if (card == null) {
            return undefined;
        }
        let hex = card.toString(16);
        if (card < 16) {
            hex = `0${hex}`;
        }
        if (hex === "4e") {
            hex = "4f";
        }
        return hex;
    }

    public static GetCardInfo(card: number): RummyCardInfo {
        let colorBase = 0;
        if (card >= 49) {
            colorBase = 48;
        } else if (card >= 33) {
            colorBase = 32;
        } else if (card >= 17) {
            colorBase = 16;
        }
        const point = card - colorBase;
        return {
            value: card,
            point,
            cardFen: RummyCardUtil.GetCardFen(point),
            color: colorBase,
        };
    }

    public static GetCardFen(point: number): number {
        if (point === 1 || point === 10 || point === 11 || point === 12 || point === 13) {
            return 10;
        }
        return point;
    }

    public static GetCardShowValue(point: number): string {
        if (point === 1) {
            return "A";
        }
        if (point === 11) {
            return "J";
        }
        if (point === 12) {
            return "Q";
        }
        if (point === 13) {
            return "K";
        }
        return `${point}`;
    }

    public static ShouldHideSettlementHand(
        playerInfo: RummyPlayerShowcardInfo,
        packetShowcard: number,
        allOthersFolded: boolean,
    ): boolean {
        if (packetShowcard === 1 || playerInfo.isfold === 1) {
            return true;
        }
        if (playerInfo.showcard === 0 || playerInfo.showcard === "0") {
            return true;
        }
        if (playerInfo.showcard === 1 || playerInfo.showcard === "1") {
            return false;
        }
        return allOthersFolded;
    }
}

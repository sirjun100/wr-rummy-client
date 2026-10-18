import { RummyCardDto } from "../config/RummyProtocol";

/** Server card DTO ↔ legacy single-byte UI encoding (not used for settlement). */
export class RummyCardCodec {
    public static dtoToLegacy(dto: RummyCardDto): number {
        if (dto.printed_joker) {
            return 79;
        }
        const suitBase = dto.suit * 16;
        let rank = dto.rank;
        if (rank === 14) {
            rank = 1;
        }
        return suitBase + rank;
    }

    public static legacyToDto(value: number, id: number): RummyCardDto {
        if (value >= 79) {
            return { id, rank: 0, suit: 0, printed_joker: true };
        }
        const suit = Math.floor(value / 16);
        const rank = value % 16;
        return { id, rank: rank === 1 ? 14 : rank, suit, printed_joker: false };
    }
}

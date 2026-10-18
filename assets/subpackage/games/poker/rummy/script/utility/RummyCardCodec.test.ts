import { RummyCardCodec } from "./RummyCardCodec";

function assert(cond: boolean, msg: string): void {
    if (!cond) {
        throw new Error(msg);
    }
}

export function runRummyCardCodecTests(): void {
    const ace = RummyCardCodec.dtoToLegacy({ id: 1, rank: 14, suit: 0, printed_joker: false });
    assert(ace === 1, "ace legacy");
    const joker = RummyCardCodec.dtoToLegacy({ id: 99, rank: 0, suit: 0, printed_joker: true });
    assert(joker === 79, "joker legacy");
    const back = RummyCardCodec.legacyToDto(17, 5);
    assert(back.rank === 14 && back.suit === 1, "legacy to dto");
}

if (typeof globalThis !== "undefined") {
    globalThis.wrRummy = { ...(globalThis.wrRummy ?? {}), runCardCodecTests: runRummyCardCodecTests };
}

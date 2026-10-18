import { RummyCardDto } from "../config/RummyProtocol";

export type RummyMeldGroup = {
    kind: number;
    cards: RummyCardDto[];
};

/** Client-side grouping placeholder; declare submits groups to server. */
export class RummyMeldHelper {
    public static defaultGroups(cards: RummyCardDto[]): RummyMeldGroup[] {
        if (cards.length === 0) {
            return [];
        }
        return [{ kind: 0, cards: [...cards] }];
    }
}

import { AbstractModel, BindableProperty } from "../../../../../../script/framework/QFramework";
import { RummyCardDto, RummyPublicView, RummyTablePushPayload } from "../config/RummyProtocol";

export class RummyModel extends AbstractModel {
    public roomId = 0;
    public templateId = "points_10";
    public tidKey = "";
    public vid = 1;

    public readonly table = new BindableProperty<RummyPublicView | null>(null);
    public handCards: RummyCardDto[] = [];
    public groups: { kind: number; cards: RummyCardDto[] }[] = [];
    public turnCd = 0;

    protected OnInit(): void {}

    public applyPush(payload: RummyTablePushPayload): void {
        if (payload.tid_key) {
            this.tidKey = payload.tid_key;
        }
        if (payload.room_id != null) {
            this.roomId = payload.room_id;
        }
        const view: RummyPublicView = {
            room_id: payload.room_id ?? this.roomId,
            format: payload.format ?? this.table.value?.format ?? "",
            phase: payload.phase ?? this.table.value?.phase ?? "",
            hand_no: payload.hand_no ?? this.table.value?.hand_no ?? 0,
            turn_uid: payload.turn_uid ?? this.table.value?.turn_uid ?? 0,
            wild_rank: payload.wild_rank ?? this.table.value?.wild_rank ?? 0,
            open_top: payload.open_top ?? this.table.value?.open_top,
            players: payload.players ?? this.table.value?.players ?? [],
            pool_scores: payload.pool_scores ?? this.table.value?.pool_scores,
            chips: payload.chips ?? this.table.value?.chips,
        };
        this.table.value = view;
        if (payload.cd != null) {
            this.turnCd = payload.cd;
        }
    }

    public applyMyCards(cards: RummyCardDto[]): void {
        this.handCards = cards;
    }

    public resetTable(): void {
        this.table.value = null;
        this.handCards = [];
        this.groups = [];
        this.turnCd = 0;
    }
}

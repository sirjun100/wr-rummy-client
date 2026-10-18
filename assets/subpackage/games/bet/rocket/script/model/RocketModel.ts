import { BindableProperty } from "../../../../../../script/framework/QFramework";
import { AbstractModel } from "../../../../../../script/framework/QFramework";
import { RocketTableDto } from "../config/RocketProtocol";

export class RocketModel extends AbstractModel {
    public readonly table = new BindableProperty<RocketTableDto | null>(null);
    public readonly tidKey = new BindableProperty<string>("");
    public templateId = "default";
    public vid = 0;

    public bets: [number, number] = [0, 0];
    public curBet: [number, number] = [0, 0];
    public autoPlay: [number, number] = [0, 0];
    public gameState = 0;
    public gameCd = 0;
    public jackPotNum = 0;
    public history: { win_rate?: string; color?: number }[] = [];

    protected OnInit(): void {}

    public applyTable(dto: RocketTableDto): void {
        this.table.value = dto;
        if (dto.tid_key) {
            this.tidKey.value = dto.tid_key;
        }
        if (dto.state != null) {
            this.gameState = dto.state;
        }
        if (dto.cd != null) {
            this.gameCd = dto.cd;
        }
        if (dto.selfbet && dto.selfbet.length === 2) {
            this.bets = [dto.selfbet[0], dto.selfbet[1]];
        }
        if (dto.cur_bet && dto.cur_bet.length === 2) {
            this.curBet = [dto.cur_bet[0], dto.cur_bet[1]];
        }
        if (dto.autoplay_st && dto.autoplay_st.length === 2) {
            this.autoPlay = [dto.autoplay_st[0], dto.autoplay_st[1]];
        }
        if (dto.history_record) {
            this.history = dto.history_record;
        }
        if (dto.jackpot_pool != null) {
            this.jackPotNum = dto.jackpot_pool;
        }
    }
}

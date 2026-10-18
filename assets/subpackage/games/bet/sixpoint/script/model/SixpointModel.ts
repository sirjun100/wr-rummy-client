import { AbstractModel, BindableProperty } from "../../../../../../script/framework/QFramework";
import { BetAreaInfo, SixpointTableDto } from "../config/SixpointProtocol";

export class SixpointModel extends AbstractModel {
    public readonly table = new BindableProperty<SixpointTableDto | null>(null);
    public readonly tidKey = new BindableProperty<string>("");
    public templateId = "default";
    public vid = 146;

    public gameState = 0;
    public gameCd = 0;
    public curBet = 0;
    public betConfig: number[] = [];
    public allBetMap: number[] = [0, 0, 0, 0, 0, 0];
    public historyRecord: number[][] = [];
    public act98Show = 0;
    public act98Param: Record<string, unknown> = {};

    protected OnInit(): void {}

    public applyTable(dto: SixpointTableDto): void {
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
        if (dto.cur_bet != null) {
            this.curBet = dto.cur_bet;
        }
        if (dto.bet_config) {
            this.betConfig = dto.bet_config;
        }
        if (dto.history_record) {
            this.historyRecord = dto.history_record;
        }
        if (dto.betAreaInfo) {
            this.applyBetAreas(dto.betAreaInfo);
        }
        if (dto.act_98_show != null) {
            this.act98Show = dto.act_98_show;
            if (dto.act_98_show === 1) {
                this.act98Param = {
                    vid: this.vid,
                    isShowTip: true,
                    bShowNetTip: true,
                    tid_key: dto.tid_key,
                    min_entry: dto.cur_bet,
                    ext: {
                        times: dto.times,
                        reward_value: dto.reward_value,
                        ad_multiple: dto.ad_multiple,
                    },
                };
            } else {
                this.act98Param = {};
            }
        }
    }

    public applyBetAreas(areas: BetAreaInfo[]): void {
        for (const a of areas) {
            const o = a.option ?? 0;
            if (o >= 0 && o < 6 && a.allbet != null) {
                this.allBetMap[o] = a.allbet;
            }
        }
    }
}

import { _decorator, Component, Label, Node, tween, Tween } from "cc";
import { RocketTableDto } from "../config/RocketProtocol";

const { ccclass, property } = _decorator;

@ccclass("RocketTablePanel")
export class RocketTablePanel extends Component {
    @property(Node)
    public waitLayout: Node | null = null;

    @property(Node)
    public flyLayout: Node | null = null;

    @property(Label)
    public historyLabel: Label | null = null;

    @property(Label)
    public jackpotLabel: Label | null = null;

    @property(Label)
    public multiplierLabel: Label | null = null;

    @property(Label)
    public waitTimeLabel: Label | null = null;

    private flyTween: Tween<Node> | null = null;
    private displayRate = 1;

    public applySnapshot(dto: RocketTableDto): void {
        if (dto.jackpot_pool != null && this.jackpotLabel) {
            this.jackpotLabel.string = `${dto.jackpot_pool}`;
        }
        if (dto.history_record && this.historyLabel) {
            const last = dto.history_record[dto.history_record.length - 1];
            this.historyLabel.string = last?.win_rate ?? "";
        }
        if (dto.state === 1) {
            this.showBetting(dto.cd ?? 0, dto.total_cd ?? 0);
        } else if (dto.state === 2) {
            this.showFlying();
            if (dto.fly_time != null && dto.win_rate != null) {
                this.setFlyProgress(dto.fly_time, dto.win_rate);
            }
        }
    }

    public showBetting(cd: number, _total: number): void {
        this.stopFlyTween();
        if (this.waitLayout) {
            this.waitLayout.active = true;
        }
        if (this.flyLayout) {
            this.flyLayout.active = false;
        }
        if (this.waitTimeLabel) {
            this.waitTimeLabel.string = `${cd}`;
        }
    }

    public showFlying(): void {
        if (this.waitLayout) {
            this.waitLayout.active = false;
        }
        if (this.flyLayout) {
            this.flyLayout.active = true;
        }
    }

    public showCrash(winRate: number, _anim: boolean): void {
        this.stopFlyTween();
        if (this.waitLayout) {
            this.waitLayout.active = true;
        }
        if (this.flyLayout) {
            this.flyLayout.active = false;
        }
        if (this.historyLabel) {
            this.historyLabel.string = `${winRate.toFixed(2)}X`;
        }
        this.updateMultiplier(winRate);
    }

    public updateMultiplier(rate: number): void {
        this.displayRate = rate;
        if (this.multiplierLabel) {
            this.multiplierLabel.string = `${rate.toFixed(2)}x`;
        }
    }

    public rocketPlayFly(
        startTime: number,
        _animIndex: number,
        onTick?: (rate: number) => void,
    ): void {
        this.showFlying();
        this.setFlyProgress(startTime, this.displayRate);
        this.stopFlyTween();
        if (!this.flyLayout) {
            return;
        }
        this.flyTween = tween(this.flyLayout)
            .repeatForever(
                tween()
                    .delay(0.05)
                    .call(() => {
                        onTick?.(this.displayRate);
                    }),
            )
            .start();
    }

    public setFlyProgress(_time: number, rate: number): void {
        this.updateMultiplier(rate);
    }

    public refreshHistoryRecode(items: { win_rate?: string }[]): void {
        if (!this.historyLabel || items.length === 0) {
            return;
        }
        this.historyLabel.string = items[items.length - 1].win_rate ?? "";
    }

    public resetInfo(): void {
        this.displayRate = 1;
        this.updateMultiplier(1);
    }

    private stopFlyTween(): void {
        if (this.flyTween) {
            this.flyTween.stop();
            this.flyTween = null;
        }
    }

    protected onDestroy(): void {
        this.stopFlyTween();
    }
}

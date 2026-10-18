import { _decorator, Component, Label, Node } from "cc";
import { RocketTableDto } from "../config/RocketProtocol";
import { RocketXiaZhuStatus } from "../config/RocketXiaZhuStatus";

const { ccclass, property } = _decorator;

@ccclass("RocketActionPanel")
export class RocketActionPanel extends Component {
    @property([Node])
    public operateRoots: Node[] = [];

    @property([Label])
    public betLabels: Label[] = [];

    @property(Label)
    public balanceLabel: Label | null = null;

    public applySnapshot(dto: RocketTableDto): void {
        if (dto.money != null && this.balanceLabel) {
            this.balanceLabel.string = `${dto.money}`;
        }
        if (dto.cur_bet) {
            for (let i = 0; i < this.betLabels.length && i < dto.cur_bet.length; i++) {
                if (this.betLabels[i]) {
                    this.betLabels[i].string = `${dto.cur_bet[i]}`;
                }
            }
        }
        if (dto.bt_state) {
            for (let i = 0; i < dto.bt_state.length; i++) {
                this.updateButtonState(dto.bt_state[i], i, dto.ext ?? {});
            }
        }
    }

    public updateButtonState(state: number, slot: number, ext: Record<string, unknown>): void {
        const root = this.operateRoots[slot];
        if (!root) {
            return;
        }
        const bet = root.getChildByName("bet_btn");
        const cancel = root.getChildByName("cancel_btn");
        const cashout = root.getChildByName("cashout_btn");
        const autobet = root.getChildByName("autobet_btn");
        if (bet) {
            bet.active = state === RocketXiaZhuStatus.Bet;
        }
        if (cancel) {
            cancel.active = state === RocketXiaZhuStatus.Cancel;
        }
        if (cashout) {
            cashout.active = state === RocketXiaZhuStatus.Checkout;
            if (cashout.active && ext.win != null) {
                const num = cashout.getChildByName("num")?.getComponent(Label);
                if (num) {
                    num.string = `${ext.win}`;
                }
            }
        }
        if (autobet) {
            autobet.active = state === RocketXiaZhuStatus.StopAutoPlay;
            if (autobet.active && ext.round != null) {
                const num = autobet.getChildByName("num")?.getComponent(Label);
                if (num) {
                    num.string = `${ext.round}`;
                }
            }
        }
    }

    public updateCoin(money: number): void {
        if (this.balanceLabel) {
            this.balanceLabel.string = `${money}`;
        }
    }
}

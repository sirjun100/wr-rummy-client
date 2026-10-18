import { _decorator, Component, Label, Node, tween, v3 } from "cc";
import { Utility } from "../../../../../../script/game/utility/Utility";

const { ccclass, property } = _decorator;

@ccclass("SixpointCardPlayerPanel")
export class SixpointCardPlayerPanel extends Component {
    @property(Label)
    public noSeatCountLabel: Label | null = null;

    @property(Label)
    public selfCoinLabel: Label | null = null;

    private seatNodes: Map<number, Node> = new Map();

    public bindSeatNodes(root: Node): void {
        for (let i = 0; i <= 7; i++) {
            const p = root.getChildByName(`player${i}`);
            if (p) {
                this.seatNodes.set(i, p);
            }
        }
    }

    public updateNoSeatCount(count: number): void {
        if (this.noSeatCountLabel) {
            this.noSeatCountLabel.string = count > 0 ? String(count) : "";
        }
    }

    public updateSelfCoin(money: number): void {
        if (this.selfCoinLabel) {
            this.selfCoinLabel.string = Utility.format.chipCompact(money);
        }
        const p6 = this.seatNodes.get(6);
        const coin = p6?.getChildByName("name_bg")?.getChildByName("coin")?.getComponent(Label);
        if (coin) {
            coin.string = Utility.format.chipCompact(money);
        }
    }

    public showFloatWord(seatId: number, amount: number): void {
        const seat = this.seatNodes.get(seatId);
        if (!seat || amount <= 0) {
            return;
        }
        const floatbg = seat.getChildByName("floatbg");
        if (!floatbg) {
            return;
        }
        const word = floatbg.getChildByName("floatword")?.getComponent(Label);
        if (word) {
            word.string = `+${Utility.format.chipCompact(amount)}`;
        }
        floatbg.active = true;
        floatbg.setPosition(v3(0, 61.659, 0));
        tween(floatbg)
            .delay(0.5)
            .by(1, { position: v3(0, 20, 0) })
            .call(() => {
                floatbg.active = false;
            })
            .start();
    }

    public jumpWhenSendBet(seatId: number): void {
        if (seatId === 6) {
            return;
        }
        const seat = this.seatNodes.get(seatId);
        if (!seat) {
            return;
        }
        const pos = seat.position.clone();
        tween(seat)
            .to(0.08, { position: v3(pos.x, pos.y + 10, pos.z) })
            .to(0.08, { position: pos })
            .start();
    }

    public setSeatVisible(seatId: number, visible: boolean): void {
        const seat = this.seatNodes.get(seatId);
        if (seat) {
            seat.active = visible;
        }
    }

    public resetTuhaoSeat(seatId: number): void {
        const seat = this.seatNodes.get(seatId);
        if (!seat) {
            return;
        }
        const empty = seat.getChildByName("empty");
        const headMask = seat.getChildByName("head_mask");
        if (empty) {
            empty.active = true;
        }
        if (headMask) {
            headMask.active = false;
        }
    }
}

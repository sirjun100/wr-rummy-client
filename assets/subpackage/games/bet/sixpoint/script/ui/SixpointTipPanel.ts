import { _decorator, Component, Label, Node, sp, tween, v3 } from "cc";
import { BetAreaInfo, SixpointPushPayload } from "../config/SixpointProtocol";

const { ccclass, property } = _decorator;

@ccclass("SixpointTipPanel")
export class SixpointTipPanel extends Component {
    @property(sp.Skeleton)
    public rollDiceAnim: sp.Skeleton | null = null;

    @property(sp.Skeleton)
    public stateAnim: sp.Skeleton | null = null;

    private winEffectNodes: Node[] = [];

    public initFromScene(tipRoot: Node): void {
        for (let i = 0; i <= 5; i++) {
            const n = tipRoot.getChildByName(`win_effect${i}`);
            if (n) {
                this.winEffectNodes[i] = n;
            }
        }
    }

    public playStartGameAnim(): void {
        if (!this.stateAnim) {
            return;
        }
        this.stateAnim.node.active = true;
        this.stateAnim.clearTracks();
        this.stateAnim.setAnimation(0, "gamestart", false);
    }

    public playRollResult(payload: SixpointPushPayload): void {
        if (!this.rollDiceAnim || !payload.diceinfo?.length) {
            return;
        }
        const sk = this.rollDiceAnim;
        sk.node.active = true;
        sk.clearTracks();
        sk.setToSetupPose();
        const prefix = "ani_kairajakai_dice_";
        for (let i = 0; i < payload.diceinfo.length; i++) {
            sk.setAttachment(`face${i + 1}`, `${prefix}${payload.diceinfo[i]}-1`);
        }
        sk.setAnimation(0, "rolldice1", false);
    }

    public playRestAnim(): void {
        if (!this.rollDiceAnim) {
            return;
        }
        this.rollDiceAnim.setAnimation(0, "rolldice0", false);
    }

    public playWinAnim(multiples: number[]): void {
        for (let i = 0; i < multiples.length; i++) {
            const m = multiples[i];
            if (m > 1) {
                const bg = this.node.getChildByName(`bei_bg${i}`);
                if (bg) {
                    bg.active = true;
                    const beishu = bg.getChildByName("beishu")?.getComponent(Label);
                    if (beishu) {
                        beishu.string = `Win x${m}`;
                    }
                    tween(bg).to(0.2, { scale: v3(1, 1, 1) }).start();
                }
            }
        }
    }

    public changeWinKuangStatus(winOp: number[]): void {
        for (const op of winOp) {
            const effect = this.winEffectNodes[op] ?? this.node.getChildByName(`win_effect${op}`);
            if (effect) {
                effect.active = true;
            }
        }
    }

    public flyGoldToZhuangJia(winOp: number[]): void {
        void winOp;
        // Visual stub: losing-area chips animate toward heguan when chip nodes are bound.
    }

    public flyGoldToRewardAreas(areas: BetAreaInfo[]): void {
        void areas;
    }

    public showSendCoinEffect(_seatId: number, _area: BetAreaInfo): void {
        void _seatId;
        void _area;
    }
}

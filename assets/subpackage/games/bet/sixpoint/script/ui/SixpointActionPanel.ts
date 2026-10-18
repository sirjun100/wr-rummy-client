import { _decorator, Component, Label, Node, sp } from "cc";
import { Utility } from "../../../../../../script/game/utility/Utility";

const { ccclass, property } = _decorator;

@ccclass("SixpointActionPanel")
export class SixpointActionPanel extends Component {
    @property(Label)
    public cdLabel: Label | null = null;

    @property(Node)
    public operateView: Node | null = null;

    public resetBetAmtView(betConfig: number[]): void {
        if (!this.operateView || betConfig.length === 0) {
            return;
        }
        for (let i = 0; i < betConfig.length; i++) {
            const n = this.operateView.getChildByName(`bet${i}`);
            const num = n?.getChildByName("num")?.getComponent(Label);
            if (num) {
                num.string = Utility.format.chipCompact(betConfig[i]);
            }
        }
    }

    public updateCurBetNum(curBet: number, betConfig: number[]): void {
        if (!this.operateView) {
            return;
        }
        for (let i = 0; i < betConfig.length; i++) {
            const n = this.operateView.getChildByName(`bet${i}`);
            const select = n?.getChildByName("select");
            if (select) {
                select.active = betConfig[i] === curBet;
            }
        }
    }

    public updateGameCd(cd: number, state: number): void {
        if (this.cdLabel) {
            this.cdLabel.string = state === 1 ? String(cd) : "";
        }
    }

    public updateGullakBtnStatus(show: number, animState = 0, playOnce = false): void {
        const actNode = this.node.getChildByName("act_node");
        const gullak = actNode?.getChildByName("gullak_btn");
        if (!gullak) {
            return;
        }
        gullak.active = show === 1;
        if (show !== 1) {
            return;
        }
        const sk = gullak.getChildByName("anim")?.getComponent(sp.Skeleton);
        if (!sk) {
            return;
        }
        sk.clearTracks();
        sk.setToSetupPose();
        if (playOnce) {
            sk.setAnimation(0, "2", false);
            sk.setCompleteListener(() => {
                sk.setCompleteListener(null);
                sk.clearTracks();
                sk.setToSetupPose();
                sk.setAnimation(0, animState === 0 ? "0" : "1", true);
            });
        } else {
            sk.setAnimation(0, animState === 0 ? "0" : "1", true);
        }
    }

    public bindGullakClick(handler: () => void): void {
        const gullak = this.node.getChildByName("act_node")?.getChildByName("gullak_btn");
        gullak?.on(Node.EventType.TOUCH_END, handler);
    }
}

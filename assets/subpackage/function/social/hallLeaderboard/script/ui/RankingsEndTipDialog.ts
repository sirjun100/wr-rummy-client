import { _decorator, Button, Label } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { runNextLobbyActivity } from "../../inviteShare/script/utility/LobbyActivityQueue";
import type { RankingsEndTipData } from "../config/RankingsProtocol";
import { AckHallRankRewardPopCommand } from "../command/AckHallRankRewardPopCommand";
import { OpenRankingsDialogCommand } from "../command/OpenRankingsDialogCommand";
import { findDeep } from "../utility/RankingsUiHelper";

const { ccclass } = _decorator;

@ccclass("RankingsEndTipDialog")
export class RankingsEndTipDialog extends BaseDialog {
    private data: RankingsEndTipData = {};

    protected OnInit(uiData: RankingsEndTipData = null): void {
        this.data = uiData ?? {};
        const hasReward = Number(this.data.has_reward ?? 0) === 1;
        const noReward = findDeep(this.node, "rootNode_noReward");
        const reward = findDeep(this.node, "rootNode_reward");
        if (hasReward && reward) {
            reward.active = true;
            this.setLabel(reward, "rankNo", this.data.rank);
            this.setLabel(reward, "reward_no", this.data.reward);
            this.setLabel(reward, "tip2", this.data.tips);
        } else if (noReward) {
            noReward.active = true;
            this.setLabel(noReward, "rankNo", this.data.rank);
            this.setLabel(noReward, "tip2", this.data.tips);
            this.setLabel(noReward, "spots", this.data.distance_reward_rank);
        }
        findDeep(this.node, "close")
            ?.getComponent(Button)
            ?.node.on(Button.EventType.CLICK, () => this.closeAck(), this);
        findDeep(this.node, "details")
            ?.getComponent(Button)
            ?.node.on(Button.EventType.CLICK, () => {
                this.CloseSelf();
                GameApp.Interface.SendCommand(new OpenRankingsDialogCommand());
                runNextLobbyActivity();
            }, this);
        findDeep(this.node, "playnow")
            ?.getComponent(Button)
            ?.node.on(Button.EventType.CLICK, () => this.closeAck(), this);
    }

    private setLabel(root: import("cc").Node, child: string, val: unknown): void {
        const n = findDeep(root, child);
        if (n?.getComponent(Label) && val != null) {
            n.getComponent(Label).string = String(val);
        }
    }

    private closeAck(): void {
        GameApp.Interface.SendCommand(new AckHallRankRewardPopCommand());
        this.CloseSelf();
        if (this.data.isNext) {
            runNextLobbyActivity();
        }
    }
}

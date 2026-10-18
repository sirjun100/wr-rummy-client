import { _decorator, v3 } from "cc";
import { MembershipUpgradeDialog } from "./MembershipUpgradeDialog";
import { GameApp } from "../../../../../script/game/GameApp";
import { AckMembershipUpgradePopCommand } from "../command/AckMembershipUpgradePopCommand";

const { ccclass } = _decorator;

@ccclass("MembershipUpgradeGameDialog")
export class MembershipUpgradeGameDialog extends MembershipUpgradeDialog {
    protected override applyNoRewardLayout(root: import("cc").Node, noReward: boolean): void {
        const ico = root.getChildByName("club_ico");
        const name = root.getChildByName("club_name");
        if (!noReward || !ico || !name) {
            return;
        }
        ico.setPosition(v3(0, 35.343));
        name.setPosition(v3(0, -68.712));
    }

    protected closeWithAck(): void {
        GameApp.Interface.SendCommand(new AckMembershipUpgradePopCommand("game"));
        this.CloseSelf();
    }
}

import { _decorator, Label, Node, Sprite, SpriteFrame, v3 } from "cc";
const { ccclass, property } = _decorator;
import { GameApp } from "../../../../../script/game/GameApp";
import { PaymentDialogBase } from "../../wallet/script/ui/PaymentDialogBase";
import { AckMembershipUpgradePopCommand } from "../command/AckMembershipUpgradePopCommand";
import { MembershipModel } from "../model/MembershipModel";
import { gradeByClubLevel } from "../utility/MembershipGradeUtil";
import { runNextLobbyActivity } from "../../../social/inviteShare/script/utility/LobbyActivityQueue";

@ccclass("MembershipUpgradeDialog")
export class MembershipUpgradeDialog extends PaymentDialogBase {
    @property(Node)
    public rootNode: Node = null;
    @property(Node)
    public rewardNode: Node = null;
    @property([SpriteFrame])
    public clubIcoSprite: SpriteFrame[] = [];

    protected OnInit(): void {
        GameApp.Interface.GetModel(MembershipModel)
            .pendingUpgrade.RegisterWithInitValue(() => this.refreshView(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.GetModel(MembershipModel)
            .playerClub.RegisterWithInitValue(() => this.refreshView(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        this.wireByName("btn_close", () => this.closeWithAck());
        this.wireByName("close", () => this.closeWithAck());
        this.refreshView();
    }

    protected OnClose(): void {
        GameApp.Interface.GetModel(MembershipModel).pendingUpgrade.value = null;
    }

    protected closeWithAck(): void {
        GameApp.Interface.SendCommand(new AckMembershipUpgradePopCommand("hall"));
        this.CloseSelf();
        runNextLobbyActivity();
    }

    private refreshView(): void {
        const upgrade = GameApp.Interface.GetModel(MembershipModel).pendingUpgrade.value;
        const pc = GameApp.Interface.GetModel(MembershipModel).playerClub.value;
        const root = this.rootNode ?? this.node;
        if (!pc.club_level) {
            return;
        }
        const grade = gradeByClubLevel(pc.club_level);
        const ico = root.getChildByName("club_ico")?.getComponent(Sprite);
        if (ico && this.clubIcoSprite[grade]) {
            ico.spriteFrame = this.clubIcoSprite[grade];
        }
        const nameLab = root.getChildByName("club_name")?.getComponent(Label);
        if (nameLab) {
            nameLab.string = pc.club_name ?? "";
        }
        const rewardRoot = this.rewardNode ?? root.getChildByName("rewardNode");
        if (!rewardRoot || !upgrade) {
            this.applyNoRewardLayout(root, false);
            return;
        }
        const cash = Number(upgrade.cash ?? 0);
        const bonus = Number(upgrade.bonus ?? 0);
        let shown = -1;
        const add = rewardRoot.getChildByName("add");
        if (add) {
            add.active = true;
        }
        const item0 = rewardRoot.getChildByName("item0");
        const item1 = rewardRoot.getChildByName("item1");
        if (cash > 0 && item0) {
            shown += 1;
            item0.active = true;
            const num = item0.getChildByName("num")?.getComponent(Label);
            if (num) {
                num.string = `₹${cash}`;
            }
        } else if (item0) {
            item0.active = false;
            if (add) {
                add.active = false;
            }
        }
        if (bonus > 0 && item1) {
            shown += 1;
            item1.active = true;
            const num = item1.getChildByName("num")?.getComponent(Label);
            if (num) {
                num.string = `₹${bonus}`;
            }
        } else if (item1) {
            item1.active = false;
            if (add) {
                add.active = false;
            }
        }
        rewardRoot.active = shown >= 0;
        const diban = root.getChildByName("diban");
        if (diban) {
            diban.active = shown >= 0;
        }
        this.applyNoRewardLayout(root, shown < 0);
    }

    protected applyNoRewardLayout(root: Node, noReward: boolean): void {
        const ico = root.getChildByName("club_ico");
        const name = root.getChildByName("club_name");
        if (!noReward || !ico || !name) {
            return;
        }
        ico.setPosition(v3(0, 89.173));
        name.setPosition(v3(0, -47.676));
    }
}

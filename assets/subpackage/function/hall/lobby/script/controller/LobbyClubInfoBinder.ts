import { _decorator, Button, Component, find, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { HallConfigModel } from "../../hallMenu/script/model/HallConfigModel";
import { MembershipModel } from "../../../../commerce/vipClub/script/model/MembershipModel";
import { gradeByClubLevel } from "../../../../commerce/vipClub/script/utility/MembershipGradeUtil";
import { ensureMembershipRegistered } from "../../../../commerce/vipClub/script/MembershipModule";

const { ccclass } = _decorator;

@ccclass("LobbyClubInfoBinder")
export class LobbyClubInfoBinder extends Component {
    private clubBtn: Node | null = null;
    private clubNameLab: Label | null = null;

    protected onLoad(): void {
        ensureMembershipRegistered();
        this.clubBtn = find("btn_clubInfo", this.node) ?? find("Canvas/btn_clubInfo", this.node);
        const nameNode = this.clubBtn ? find("club_name", this.clubBtn) : null;
        this.clubNameLab = nameNode?.getComponent(Label) ?? null;
        const btn = this.clubBtn?.getComponent(Button);
        if (btn) {
            btn.node.on(Button.EventType.CLICK, () => void this.openClub(), this);
        }
        GameApp.Interface.GetModel(HallConfigModel)
            .config.RegisterWithInitValue(() => this.applyVisibility(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.GetModel(MembershipModel)
            .playerClub.RegisterWithInitValue((pc) => this.applyClubInfo(pc), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        this.applyVisibility();
        this.applyClubInfo(GameApp.Interface.GetModel(MembershipModel).playerClub.value);
    }

    private applyVisibility(): void {
        if (!this.clubBtn) {
            return;
        }
        this.clubBtn.active = !GameApp.Interface.GetModel(HallConfigModel).isClubBlocked();
    }

    private applyClubInfo(pc: { club_level?: number; club_name?: string }): void {
        if (this.clubNameLab) {
            const grade = gradeByClubLevel(pc.club_level ?? 0);
            this.clubNameLab.string = pc.club_name?.length ? pc.club_name : grade > 0 ? `CLUB ${grade}` : "";
        }
    }

    private async openClub(): Promise<void> {
        if (GameApp.Interface.GetModel(HallConfigModel).isClubBlocked()) {
            return;
        }
        await import("../../../../commerce/wallet/script/PurseModule").then((m) => m.openMembership());
    }
}

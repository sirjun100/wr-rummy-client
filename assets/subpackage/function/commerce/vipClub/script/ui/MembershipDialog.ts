import { _decorator, Node, ScrollView, SpriteFrame } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { PaymentDialogBase } from "../../wallet/script/ui/PaymentDialogBase";
import { FetchMembershipClubPageCommand } from "../command/FetchMembershipClubPageCommand";
import { MembershipModel } from "../model/MembershipModel";
import { MembershipDegreeScrollBinder } from "../utility/MembershipDegreeScrollBinder";
import { buildMembershipHelpText } from "../utility/MembershipHelpUtil";
const { ccclass, property } = _decorator;

@ccclass("Membership")
export class MembershipDialog extends PaymentDialogBase {
    @property(Node)
    public root: Node = null;
    @property(Node)
    public degreeMoban0: Node = null;
    @property(Node)
    public degreeMoban1: Node = null;
    @property([SpriteFrame])
    public clubDegreeIcos: SpriteFrame[] = [];
    @property(ScrollView)
    public scrollView: ScrollView = null;

    private binder: MembershipDegreeScrollBinder | null = null;
    private countdownTimer: ReturnType<typeof setInterval> | null = null;

    protected OnInit(): void {
        this.binder = new MembershipDegreeScrollBinder({
            root: this.root,
            degreeMoban0: this.degreeMoban0,
            degreeMoban1: this.degreeMoban1,
            clubDegreeIcos: this.clubDegreeIcos,
            scrollView: this.scrollView,
            node: this.node,
        });
        GameApp.Interface.SendCommand(new FetchMembershipClubPageCommand());
        GameApp.Interface.GetModel(MembershipModel)
            .page.RegisterWithInitValue((p) => this.applyPage(p), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        this.wireByName("back_btn", () => this.CloseSelf());
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("help_btn", () => void this.openHelp());
    }

    protected OnClose(): void {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
        this.binder?.dispose();
    }

    private applyPage(page: import("../config/MembershipProtocol").ClubPageDto): void {
        if (!page.list?.length) {
            return;
        }
        this.binder?.applyPage(page);
        this.startCountdownTick();
    }

    private startCountdownTick(): void {
        if (this.countdownTimer) {
            return;
        }
        this.countdownTimer = setInterval(() => {
            const model = GameApp.Interface.GetModel(MembershipModel);
            const pc = model.playerClub.value;
            const left = Number(pc.left_second ?? 0);
            if (left <= 0) {
                return;
            }
            const next = left - 1;
            model.applyPlayerClub({ ...pc, left_second: next });
            if (next <= 0) {
                GameApp.Interface.SendCommand(new FetchMembershipClubPageCommand());
            } else if (next < 120) {
                this.binder?.applyPage(model.page.value);
            }
        }, 1000);
    }

    private openHelp(): void {
        const page = GameApp.Interface.GetModel(MembershipModel).page.value;
        const tips = buildMembershipHelpText(page);
        void import("../../../shared/commonUi/script/PublicModule").then((m) => {
            m.showHelp(tips);
        });
    }
}

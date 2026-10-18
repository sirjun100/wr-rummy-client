import { _decorator, Button, Label } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { ChallengerOptEntryCommand } from "../../../../../script/game/challenger/command/ChallengerOptEntryCommand";
import { runNextLobbyActivity } from "../../inviteShare/script/utility/LobbyActivityQueue";
import type { RankingsPopActData } from "../config/RankingsProtocol";
import { OpenRankingsDialogCommand } from "../command/OpenRankingsDialogCommand";
import { findDeep } from "../utility/RankingsUiHelper";

const { ccclass } = _decorator;

@ccclass("RankingsPopActDialog")
export class RankingsPopActDialog extends BaseDialog {
    private data: RankingsPopActData = {};

    protected OnInit(uiData: RankingsPopActData = null): void {
        this.data = uiData ?? {};
        const root = findDeep(this.node, "rootNode") ?? this.node;
        const date = findDeep(root, "date");
        date?.getComponent(Label) && (date.getComponent(Label).string = this.data.time_str ?? "");
        const total = findDeep(root, "total_reward");
        if (total?.getComponent(Label)) {
            let t = this.data.total_reward ?? "";
            if (t.includes("₹")) {
                t = t.split("₹")[1] ?? t;
            }
            total.getComponent(Label).string = t;
        }
        const optBtn = findDeep(root, "optin_btn");
        const playBtn = findDeep(root, "playnow_btn");
        const opted = Number(this.data.entry_status ?? 0) === 1;
        if (optBtn) {
            optBtn.active = !opted;
        }
        if (playBtn) {
            playBtn.active = opted;
        }
        const mega = this.data.mega_rank ?? [];
        for (let i = 0; i < 3; i++) {
            const reward = findDeep(root, `reward${i}`);
            if (reward?.getComponent(Label) && mega[i]?.bmoney) {
                reward.getComponent(Label).string = `₹${mega[i].bmoney}`;
            }
        }
        this.wire(root);
    }

    private wire(root: import("cc").Node): void {
        const close = findDeep(root, "close");
        close?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => this.closeWithQueue(), this);
        findDeep(root, "optin_btn")
            ?.getComponent(Button)
            ?.node.on(Button.EventType.CLICK, () => this.onOptIn(), this);
        findDeep(root, "playnow_btn")
            ?.getComponent(Button)
            ?.node.on(Button.EventType.CLICK, () => this.closeWithQueue(), this);
        findDeep(root, "details")
            ?.getComponent(Button)
            ?.node.on(Button.EventType.CLICK, () => {
                this.CloseSelf();
                GameApp.Interface.SendCommand(new OpenRankingsDialogCommand());
                runNextLobbyActivity();
            }, this);
    }

    private onOptIn(): void {
        GameApp.Interface.SendCommand(
            new ChallengerOptEntryCommand(1, () => {
                this.data.entry_status = 1;
                const root = findDeep(this.node, "rootNode") ?? this.node;
                const optBtn = findDeep(root, "optin_btn");
                const playBtn = findDeep(root, "playnow_btn");
                if (optBtn) {
                    optBtn.active = false;
                }
                if (playBtn) {
                    playBtn.active = true;
                }
            }),
        );
    }

    private closeWithQueue(): void {
        this.CloseSelf();
        if (this.data.isNext) {
            runNextLobbyActivity();
        }
    }
}

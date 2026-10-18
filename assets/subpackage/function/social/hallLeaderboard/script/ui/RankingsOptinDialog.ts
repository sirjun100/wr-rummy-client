import { _decorator, Button, Label } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { ChallengerOptEntryCommand } from "../../../../../script/game/challenger/command/ChallengerOptEntryCommand";
import type { RankingsOptinData } from "../config/RankingsProtocol";
import { findDeep } from "../utility/RankingsUiHelper";

type OptinUiData = RankingsOptinData & { onStatus?: (status: number) => void };

const { ccclass } = _decorator;

@ccclass("RankingsOptinDialog")
export class RankingsOptinDialog extends BaseDialog {
    private data: OptinUiData = {};

    protected OnInit(uiData: OptinUiData = null): void {
        this.data = uiData ?? {};
        const optIn = findDeep(this.node, "optInNode") ?? findDeep(this.node, "opt_in");
        const total = findDeep(optIn ?? this.node, "total");
        if (total?.getComponent(Label) && this.data.total_reward_num) {
            total.getComponent(Label).string = this.data.total_reward_num;
        }
        findDeep(this.node, "opt_in_close")
            ?.getComponent(Button)
            ?.node.on(Button.EventType.CLICK, () => this.CloseSelf(), this);
        findDeep(this.node, "opt_in_process")
            ?.getComponent(Button)
            ?.node.on(Button.EventType.CLICK, () => this.processOptIn(), this);
        findDeep(this.node, "opt_in_playnow")
            ?.getComponent(Button)
            ?.node.on(Button.EventType.CLICK, () => {
                this.CloseSelf();
                const wr = (globalThis as { wrLobby?: { openFastBuy?: () => Promise<void> } }).wrLobby;
                void wr?.openFastBuy?.();
            }, this);
    }

    private processOptIn(): void {
        GameApp.Interface.SendCommand(
            new ChallengerOptEntryCommand(1, () => {
                const status = 1;
                this.data.onStatus?.(status);
                const optIn = findDeep(this.node, "optInNode") ?? findDeep(this.node, "opt_in");
                const suc = findDeep(this.node, "optSucNode") ?? findDeep(this.node, "opt_in_suc");
                if (optIn) {
                    optIn.active = false;
                }
                if (suc) {
                    suc.active = true;
                }
            }),
        );
    }
}

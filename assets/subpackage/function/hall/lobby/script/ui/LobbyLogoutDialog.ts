import { _decorator } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { ensureHallRegistered } from "../../hallMenu/script/CarteModule";
import { LogoutCommand } from "../../hallMenu/script/command/LogoutCommand";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";

const { ccclass } = _decorator;

@ccclass("LobbyLogoutDialog")
export class LobbyLogoutDialog extends BaseDialog {
    protected OnInit(): void {
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("btn_cancel", () => this.CloseSelf());
        this.wireByName("btn_ok", () => this.onAssure());
        this.wireByName("onAssureClick", () => this.onAssure());
        this.wireByName("onCloseClick", () => this.CloseSelf());
    }

    protected OnClose(): void {}

    private onAssure(): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        ensureHallRegistered();
        this.CloseSelf();
        GameApp.Interface.SendCommand(new LogoutCommand());
    }

    private wireByName(name: string, fn: () => void): void {
        const stack = [this.node];
        while (stack.length) {
            const n = stack.pop()!;
            if (n.name === name) {
                n.on("click", fn, this);
            }
            for (const c of n.children) {
                stack.push(c);
            }
        }
    }
}

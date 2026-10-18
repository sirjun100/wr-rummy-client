import { _decorator, EditBox, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { ensureHallRegistered } from "../../hallMenu/script/CarteModule";
import { RedeemCodeCommand } from "../../hallMenu/script/command/RedeemCodeCommand";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";

const { ccclass, property } = _decorator;

@ccclass("RedemptionCodeDialog")
export class RedemptionCodeDialog extends BaseDialog {
    @property(EditBox)
    public edit_code: EditBox = null;

    @property(Node)
    public errNode: Node = null;

    private lastClick = 0;

    protected OnInit(): void {
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("redeem", () => this.onRedeem());
    }

    protected OnClose(): void {}

    private onRedeem(): void {
        const now = Date.now();
        if (now - this.lastClick < 1000) {
            return;
        }
        this.lastClick = now;
        const code = this.edit_code?.string?.trim() ?? "";
        if (code.length < 8 || code.length > 30) {
            this.showErr("Invalid code length");
            return;
        }
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        ensureHallRegistered();
        GameApp.Interface.SendCommand(
            new RedeemCodeCommand(code, 1, (err) => {
                if (err) {
                    this.showErr(err);
                    return;
                }
                if (this.edit_code) {
                    this.edit_code.string = "";
                }
                if (this.errNode) {
                    this.errNode.active = false;
                }
                this.CloseSelf();
            }),
        );
    }

    private showErr(msg: string): void {
        if (!this.errNode) {
            return;
        }
        this.errNode.active = true;
        const lb = this.errNode.getComponent(Label);
        if (lb) {
            lb.string = msg;
        }
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

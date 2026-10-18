import { _decorator } from "cc";
import { BaseDialog } from "../../../../../../script/game/controller/engine/BaseDialog";
import { GameApp } from "../../../../../../script/game/GameApp";
import { RocketAutoBetCommand } from "../../command/RocketAutoBetCommand";

const { ccclass } = _decorator;

@ccclass("RocketAutoplayDialog")
export class RocketAutoplayDialog extends BaseDialog {
    public confirm(slot: number, rounds: number, autoOut: number, enable: number): void {
        GameApp.Interface.SendCommand(new RocketAutoBetCommand(slot, enable, rounds, autoOut));
        this.CloseSelf();
    }
}

import { _decorator, Label } from "cc";
import { BaseDialog } from "../../../../../../script/game/controller/engine/BaseDialog";
import { GameApp } from "../../../../../../script/game/GameApp";
import { RocketJackpotListCommand } from "../../command/RocketJackpotListCommand";
import { RocketJackpotListEvent } from "../../event/RocketEvents";

const { ccclass, property } = _decorator;

@ccclass("RocketJpDialog")
export class RocketJpDialog extends BaseDialog {
    @property(Label)
    public listLabel: Label | null = null;

    protected OnInit(): void {
        GameApp.Interface.SendCommand(new RocketJackpotListCommand(0));
        GameApp.Interface.RegisterEvent(RocketJackpotListEvent, (e) => {
            if (this.listLabel) {
                this.listLabel.string = JSON.stringify(e.data.list ?? []);
            }
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
    }
}

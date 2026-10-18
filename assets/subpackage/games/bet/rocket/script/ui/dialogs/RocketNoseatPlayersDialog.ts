import { _decorator, Label } from "cc";
import { BaseDialog } from "../../../../../../script/game/controller/engine/BaseDialog";
import { GameApp } from "../../../../../../script/game/GameApp";
import { RocketPlayersPageCommand } from "../../command/RocketPlayersPageCommand";
import { RocketPlayersPageEvent } from "../../event/RocketEvents";

const { ccclass, property } = _decorator;

@ccclass("RocketNoseatPlayersDialog")
export class RocketNoseatPlayersDialog extends BaseDialog {
    @property(Label)
    public listLabel: Label | null = null;

    protected OnInit(): void {
        GameApp.Interface.SendCommand(new RocketPlayersPageCommand(1));
        GameApp.Interface.RegisterEvent(RocketPlayersPageEvent, (e) => {
            if (this.listLabel) {
                this.listLabel.string = JSON.stringify(e.data.list ?? []);
            }
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
    }

    public loadPage(page: number): void {
        GameApp.Interface.SendCommand(new RocketPlayersPageCommand(page));
    }
}

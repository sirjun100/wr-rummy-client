import { _decorator } from "cc";
import { BaseDialog } from "../../../../../../script/game/controller/engine/BaseDialog";

const { ccclass } = _decorator;

@ccclass("CricketNotLineupDialog")
export class CricketNotLineupDialog extends BaseDialog {
    protected OnClose(): void {}
}

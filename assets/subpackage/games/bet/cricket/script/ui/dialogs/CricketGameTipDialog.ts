import { _decorator } from "cc";
import { BaseDialog } from "../../../../../../script/game/controller/engine/BaseDialog";

const { ccclass } = _decorator;

@ccclass("CricketGameTipDialog")
export class CricketGameTipDialog extends BaseDialog {
    protected OnClose(): void {}
}

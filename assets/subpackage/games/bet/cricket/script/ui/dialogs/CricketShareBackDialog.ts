import { _decorator } from "cc";
import { BaseDialog } from "../../../../../../script/game/controller/engine/BaseDialog";

const { ccclass } = _decorator;

@ccclass("CricketShareBackDialog")
export class CricketShareBackDialog extends BaseDialog {
    protected OnClose(): void {}
}

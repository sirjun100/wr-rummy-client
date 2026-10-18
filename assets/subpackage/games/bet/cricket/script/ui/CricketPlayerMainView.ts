import { _decorator } from "cc";
import { IUIData, UIPanel } from "../../../../../../script/framework/toolkits/uiKit/UIKit";

const { ccclass } = _decorator;

@ccclass("CricketPlayerMainView")
export class CricketPlayerMainView extends UIPanel {
    protected OnInit(_uiData: IUIData = null): void {}

    protected OnClose(): void {}
}

import { IUIData, UIPanel } from "../../../framework/toolkits/uiKit/UIKit";
import { GameApp } from "../../GameApp";
import { UISystem } from "../../system/UISystem";

/** 子包 *Dialog.prefab 脚本基类；子类须 `@ccclass` 与类名一致并实现 `OnClose`。 */
export abstract class BaseDialog extends UIPanel {
    protected OnInit(_uiData: IUIData = null): void {}

    protected OnClose(): void {}

    protected CloseSelf(): void {
        GameApp.Interface.GetSystem(UISystem).closeDialog(this);
    }
}

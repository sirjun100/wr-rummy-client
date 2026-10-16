import { _decorator } from "cc";
import { BaseDialog } from "../controller/engine/BaseDialog";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";

const { ccclass } = _decorator;

/** 试点 Dialog：resources/ui/dialog/webview/WebViewDialog.prefab */
@ccclass("WebViewDialog")
export class WebViewDialog extends BaseDialog {
    public onClickClose(): void {
        LogKit.I("[WebViewDialog] close");
        this.CloseSelf();
    }
}

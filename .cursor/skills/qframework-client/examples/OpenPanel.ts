/**
 * UIKit 打开面板
 */
import { UIKit, UILevel, PanelOpenType } from "../../framework/toolkits/uiKit/UIKit";
// import { LoginPanel } from "...";

export function openLoginPanel(): void {
    // UIKit.OpenPanel(LoginPanel, UILevel.PopUI, null, "lobby", "LoginPanel", PanelOpenType.Single);
    UIKit.OpenPanelAsync(
        null as any, // LoginPanel
        (panel) => {
            if (panel) {
                panel.Show();
            }
        },
        UILevel.PopUI,
        null,
        "lobby",
        "LoginPanel"
    );
}

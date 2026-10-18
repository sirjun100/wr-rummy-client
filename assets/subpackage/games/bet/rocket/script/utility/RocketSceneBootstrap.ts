import { Button, find, Label, Node } from "cc";
import { RocketGameSceneController } from "../controller/RocketGameSceneController";
import { RocketMainView } from "../ui/RocketMainView";
import { RocketTablePanel } from "../ui/RocketTablePanel";
import { RocketActionPanel } from "../ui/RocketActionPanel";
import { RocketTrendPanel } from "../ui/RocketTrendPanel";

/** Runtime scene wiring when editor bindings are missing (RocketGame.scene from legacy). */
export function bootstrapRocketScene(canvas: Node): void {
    if (!canvas.getComponent(RocketGameSceneController)) {
        canvas.addComponent(RocketGameSceneController);
    }
    let main = canvas.getComponent(RocketMainView);
    if (!main) {
        main = canvas.addComponent(RocketMainView);
    }
    const root = find("root", canvas) ?? canvas.getChildByName("root") ?? canvas.children[1];
    if (!root) {
        return;
    }
    let table = root.getComponent(RocketTablePanel);
    if (!table) {
        table = root.addComponent(RocketTablePanel);
    }
    table.waitLayout = find("waite_layout", root) ?? table.waitLayout;
    table.flyLayout = find("fly_layout", root) ?? table.flyLayout;
    const histNode = find("trendList", root);
    if (histNode && !table.historyLabel) {
        table.historyLabel = histNode.getComponent(Label) ?? histNode.getComponentInChildren(Label);
    }
    const jpNode = find("jackpotPool", root);
    if (jpNode && !table.jackpotLabel) {
        table.jackpotLabel = jpNode.getComponent(Label) ?? jpNode.getComponentInChildren(Label);
    }
    let action = root.getComponent(RocketActionPanel);
    if (!action) {
        action = root.addComponent(RocketActionPanel);
    }
    let trend = root.getComponent(RocketTrendPanel);
    if (!trend) {
        trend = root.addComponent(RocketTrendPanel);
    }
    main.tablePanel = table;
    main.actionPanel = action;
    const close = find("btn_close", root);
    if (close) {
        const btn = close.getComponent(Button);
        if (btn) {
            btn.node.off(Button.EventType.CLICK);
            btn.node.on(Button.EventType.CLICK, () => main?.onLeave());
        }
    }
}

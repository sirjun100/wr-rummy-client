import { Button, Label, Node } from "cc";
import type { ActCollectItemDto } from "../../lobby/script/config/LobbyProtocol";

export function bindActivityItem(node: Node, item: ActCollectItemDto, onClick: (actId: number) => void): void {
    const title = node.getChildByName("name")?.getComponent(Label) ?? node.getChildByName("Label")?.getComponent(Label);
    if (title) {
        title.string = `Act ${item.act_id}`;
    }
    const red = node.getChildByName("redpot");
    if (red) {
        const ext = item.ext as { has_red?: number } | undefined;
        red.active = ext?.has_red === 1;
    }
    const btn = node.getComponent(Button);
    const handler = () => onClick(item.act_id);
    if (btn) {
        btn.node.off(Button.EventType.CLICK);
        btn.node.on(Button.EventType.CLICK, handler);
    } else {
        node.off(Node.EventType.TOUCH_END);
        node.on(Node.EventType.TOUCH_END, handler);
    }
}

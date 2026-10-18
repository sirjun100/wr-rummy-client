import { instantiate, Label, Node } from "cc";
import type { MailItemDto } from "../config/LobbyTopViewProtocol";

export function renderMailList(container: Node, template: Node, items: MailItemDto[], onSelect: (item: MailItemDto) => void): void {
    template.active = false;
    for (const child of [...container.children]) {
        if (child !== template) {
            child.destroy();
        }
    }
    for (const item of items) {
        const row = instantiate(template);
        row.active = true;
        row.parent = container;
        const title = row.getChildByName("title")?.getComponent(Label) ?? row.getComponentInChildren(Label);
        if (title) {
            title.string = item.title ?? item.eid;
        }
        row.on(Node.EventType.TOUCH_END, () => onSelect(item));
    }
}

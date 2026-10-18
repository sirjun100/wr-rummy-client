import { Label, Node } from "cc";
import type { FaqCategoryDto } from "../config/PublicProtocol";
import { findNodeByName } from "../utility/PublicDialogUtil";

export function bindFaqCategories(root: Node, categories: FaqCategoryDto[]): void {
    const expanded = new Set<number>();
    for (let i = 0; i < 20; i++) {
        const titleNode = findNodeByName(root, `title${i}`);
        const bodyNode = findNodeByName(root, `wz${i}`);
        if (!titleNode && !bodyNode) {
            continue;
        }
        const cat = categories[i];
        if (!cat) {
            titleNode?.active = false;
            bodyNode?.active = false;
            continue;
        }
        titleNode?.active = true;
        const titleLab = titleNode?.getComponent(Label) ?? titleNode?.getChildByName("label")?.getComponent(Label);
        if (titleLab) {
            titleLab.string = cat.title ?? cat.id ?? "";
        }
        const bodyText = (cat.items ?? [])
            .map((it) => {
                const q = (it.q ?? "").trim();
                const a = (it.a ?? "").trim();
                if (q && a) {
                    return `${q}\n${a}`;
                }
                return q || a;
            })
            .filter(Boolean)
            .join("\n\n");
        if (bodyNode) {
            const bodyLab = bodyNode.getComponent(Label);
            if (bodyLab) {
                bodyLab.string = bodyText;
            }
            bodyNode.active = expanded.has(i);
        }
        if (titleNode) {
            titleNode.off(Node.EventType.TOUCH_END);
            titleNode.on(Node.EventType.TOUCH_END, () => {
                if (expanded.has(i)) {
                    expanded.delete(i);
                    if (bodyNode) {
                        bodyNode.active = false;
                    }
                } else {
                    expanded.add(i);
                    if (bodyNode) {
                        bodyNode.active = true;
                    }
                }
            });
        }
    }
}

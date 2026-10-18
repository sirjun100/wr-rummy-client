import { Button, Label, Node, Vec3 } from "cc";

export function findNodeByName(root: Node, name: string): Node | null {
    const stack: Node[] = [root];
    while (stack.length) {
        const n = stack.pop()!;
        if (n.name === name) {
            return n;
        }
        for (const c of n.children) {
            stack.push(c);
        }
    }
    return null;
}

export function setLabelOnNode(root: Node, nodeName: string, text: string): void {
    const n = findNodeByName(root, nodeName);
    const lab = n?.getComponent(Label);
    if (lab) {
        lab.string = text;
    }
}

export function wireButtonByName(root: Node, name: string, fn: () => void, target: object): void {
    const n = findNodeByName(root, name);
    const btn = n?.getComponent(Button);
    if (btn) {
        btn.node.off(Button.EventType.CLICK);
        btn.node.on(Button.EventType.CLICK, fn, target);
    } else if (n) {
        n.off(Button.EventType.CLICK);
        n.on(Button.EventType.CLICK, fn, target);
    }
}

export function applyLandscape(root: Node, landscape?: boolean): void {
    if (!landscape) {
        return;
    }
    root.setRotationFromEuler(new Vec3(0, 0, 90));
}

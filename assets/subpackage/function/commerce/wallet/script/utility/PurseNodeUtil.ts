import { Button, Label, Node } from "cc";

export function findNode(root: Node, name: string): Node | null {
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

export function setLabel(root: Node, name: string, text: string): void {
    const n = findNode(root, name);
    const lab = n?.getComponent(Label);
    if (lab) {
        lab.string = text;
    }
}

export function wireBtn(root: Node, name: string, fn: () => void, target: object): void {
    const n = findNode(root, name);
    const btn = n?.getComponent(Button);
    if (btn) {
        btn.node.off(Button.EventType.CLICK);
        btn.node.on(Button.EventType.CLICK, fn, target);
    }
}

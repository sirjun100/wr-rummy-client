import { _decorator, Component, Node, v3, view } from "cc";

const { ccclass } = _decorator;

@ccclass("NetworkDelayOverlay")
export class NetworkDelayOverlay extends Component {
    private static rootNode: Node | null = null;

    public static bindRoot(node: Node): void {
        NetworkDelayOverlay.rootNode = node;
        const bg = node.getChildByName("network_bg");
        if (bg) {
            bg.active = false;
        }
    }

    public static setOverlayVisible(visible: boolean): void {
        const root = NetworkDelayOverlay.rootNode;
        if (!root) {
            return;
        }
        const bg = root.getChildByName("network_bg");
        if (bg) {
            bg.active = visible;
        }
    }

    public static applyLandscape(): void {
        const root = NetworkDelayOverlay.rootNode;
        if (!root) {
            return;
        }
        const size = view.getVisibleSize();
        if (size.width > size.height) {
            root.setRotationFromEuler(v3(0, 0, -90));
        }
    }

    public static clearRoot(): void {
        NetworkDelayOverlay.rootNode = null;
    }
}

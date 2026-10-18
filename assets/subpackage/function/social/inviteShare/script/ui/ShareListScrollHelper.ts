import { _decorator, Component, Node, ScrollView } from "cc";

const { ccclass, property } = _decorator;

@ccclass("ShareListScrollHelper")
export class ShareListScrollHelper extends Component {
    @property(ScrollView)
    public scrollView: ScrollView = null;

    public onReachBottom: (() => void) | null = null;

    private bound = false;

    public bindReachBottom(fn: () => void): void {
        this.onReachBottom = fn;
        if (this.bound) {
            return;
        }
        const sv = this.scrollView ?? this.getComponent(ScrollView);
        if (!sv) {
            return;
        }
        this.bound = true;
        sv.node.on(ScrollView.EventType.SCROLL_ENDED, () => {
            const offset = sv.getScrollOffset();
            const max = sv.getMaxScrollOffset();
            if (max.y > 0 && offset.y >= max.y - 8) {
                this.onReachBottom?.();
            }
        });
    }
}

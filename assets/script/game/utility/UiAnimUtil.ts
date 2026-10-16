import { Node, sys, v3, Vec3 } from "cc";
import { NodeUtil } from "./NodeUtil";
import { TweenUtil } from "./TweenUtil";

export type PushAnimOptions = {
    startPos?: Vec3;
    endPos?: Vec3;
    moveTime?: number;
};

/** 面板入场动画（迁移自 ToolUtils.showPushAnim / startShowAnim）。 */
export class UiAnimUtil {
    public static ShowPushAnim(
        node: Node,
        direction: number = 0,
        onComplete: (() => void) | null = null,
        options: PushAnimOptions | null = null,
    ): void {
        if (!NodeUtil.IsValid(node)) {
            return;
        }
        const distance = direction === 4 || direction === 5 ? 1640 : 720;
        let duration = 0.27;
        let fromPos = v3(distance, 0);
        let toPos = v3(0, 0);
        if (direction === 1) {
            fromPos = v3(0, 0);
            toPos = v3(distance, 0);
        } else if (direction === 5) {
            fromPos = v3(-distance, 0);
            toPos = v3(0, 0);
        }
        if (options) {
            if (sys.isObjectValid(options.startPos)) {
                fromPos = options.startPos;
            }
            if (sys.isObjectValid(options.endPos)) {
                toPos = options.endPos;
            }
            if (sys.isObjectValid(options.moveTime)) {
                duration = options.moveTime;
            }
        }
        TweenUtil.stopNodeAction(node);
        node.setPosition(fromPos);
        TweenUtil.moveTo(node, duration, toPos, "cubicOut", true, () => {
            node.setPosition(toPos);
            onComplete?.();
        });
    }

    public static StartShowAnim(
        node: Node,
        onComplete: (() => void) | null = null,
        startScale: number = 0.2,
    ): void {
        node.setScale(v3(startScale, startScale, startScale));
        TweenUtil.scaleTo(node, 0.2, v3(1, 1, 1), "backOut", true, () => {
            node.setScale(v3(1, 1, 1));
            onComplete?.();
        });
    }
}

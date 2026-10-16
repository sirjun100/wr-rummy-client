import { Node, tween, Tween, Vec3 } from "cc";

/** 对齐 111assets ToolUtils.showPushAnim 的 mode 参数 */
export enum UiAnimType {
    None = -1,
    SlideInRight = 0,
    SlideOutRight = 1,
    SlideInBottom = 2,
    Custom = 3,
    SlideInLeft = 5,
    ScalePop = 10,
}

export type UiAnimCustomOptions = {
    startPos?: Vec3;
    endPos?: Vec3;
    moveTime?: number;
};

const DEFAULT_MOVE_TIME = 0.27;
const SLIDE_DISTANCE = 720;
const WIDE_SLIDE_DISTANCE = 1640;

export class UiAnimUtil {
    public static stopNodeTween(node: Node): void {
        if (!node?.isValid) {
            return;
        }
        Tween.stopAllByTarget(node);
    }

    /** 进入/退出滑入动画（mode 0/1/2/5，或 Custom） */
    public static playPushAnim(
        node: Node,
        mode: UiAnimType,
        onComplete?: () => void,
        custom?: UiAnimCustomOptions,
    ): void {
        if (!node?.isValid) {
            onComplete?.();
            return;
        }
        const wide = mode === UiAnimType.SlideInLeft || mode === UiAnimType.Custom;
        const span = wide ? WIDE_SLIDE_DISTANCE : SLIDE_DISTANCE;
        let start = new Vec3(span, 0, 0);
        let end = new Vec3(0, 0, 0);
        let moveTime = DEFAULT_MOVE_TIME;

        if (mode === UiAnimType.SlideOutRight) {
            start = new Vec3(0, 0, 0);
            end = new Vec3(span, 0, 0);
        } else if (mode === UiAnimType.SlideInLeft) {
            start = new Vec3(-span, 0, 0);
            end = new Vec3(0, 0, 0);
        } else if (mode === UiAnimType.SlideInBottom) {
            start = new Vec3(0, -span, 0);
            end = new Vec3(0, 0, 0);
        }

        if (custom?.startPos) {
            start = custom.startPos.clone();
        }
        if (custom?.endPos) {
            end = custom.endPos.clone();
        }
        if (custom?.moveTime != null) {
            moveTime = custom.moveTime;
        }

        UiAnimUtil.stopNodeTween(node);
        node.setPosition(start);
        tween(node)
            .to(moveTime, { position: end }, { easing: "cubicOut" })
            .call(() => {
                node.setPosition(end);
                onComplete?.();
            })
            .start();
    }

    public static playOpenAnim(node: Node, anim: UiAnimType, onComplete?: () => void, custom?: UiAnimCustomOptions): void {
        if (anim === UiAnimType.None) {
            onComplete?.();
            return;
        }
        if (anim === UiAnimType.ScalePop) {
            UiAnimUtil.playScalePopIn(node, onComplete);
            return;
        }
        UiAnimUtil.playPushAnim(node, anim, onComplete, custom);
    }

    public static playCloseAnim(node: Node, anim: UiAnimType, onComplete?: () => void, custom?: UiAnimCustomOptions): void {
        if (anim === UiAnimType.None) {
            onComplete?.();
            return;
        }
        if (anim === UiAnimType.ScalePop) {
            UiAnimUtil.playScalePopOut(node, onComplete);
            return;
        }
        const closeMode =
            anim === UiAnimType.SlideInRight
                ? UiAnimType.SlideOutRight
                : anim === UiAnimType.SlideInBottom
                  ? UiAnimType.SlideOutRight
                  : anim;
        UiAnimUtil.playPushAnim(node, closeMode, onComplete, custom);
    }

    /** 对齐 ToolUtils.startShowAnim */
    public static playScalePopIn(node: Node, onComplete?: () => void, fromScale = 0.2): void {
        if (!node?.isValid) {
            onComplete?.();
            return;
        }
        UiAnimUtil.stopNodeTween(node);
        node.setScale(fromScale, fromScale, fromScale);
        tween(node)
            .to(0.2, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" })
            .call(() => {
                node.setScale(1, 1, 1);
                onComplete?.();
            })
            .start();
    }

    public static playScalePopOut(node: Node, onComplete?: () => void, toScale = 0.2): void {
        if (!node?.isValid) {
            onComplete?.();
            return;
        }
        UiAnimUtil.stopNodeTween(node);
        tween(node)
            .to(0.2, { scale: new Vec3(toScale, toScale, toScale) }, { easing: "backIn" })
            .call(() => onComplete?.())
            .start();
    }
}

/**
 * Tween 工具组件：封装 cc tween 的位移、缩放、透明度与定时回调
 * 对外均为 static 方法，签名中参数顺序与历史调用保持一致
 */
import {
    Color,
    isValid,
    Label,
    Node,
    Size,
    Sprite,
    sys,
    tween,
    Tween,
    UIOpacity,
    UITransform,
    Vec3,
    color,
    size,
} from "cc";

/** 缓动名（与 cc tween easing 一致，历史代码常传 null） */
type TweenEasingName = string | null | undefined;

/** tween 结束回调（历史调用常显式传 null） */
type TweenCompleteFn = (() => void) | null | undefined;

/** 绑定在节点上的 Tween 实例 */
type NodeTween = Tween<Node>;

/** fadeInOut 配置（与历史字段名一致） */
export interface TweenFadeInOutOptions {
    target_position: Vec3;
    fadeStart: number;
    fadeEnd: number;
    duration: number;
    font_change?: boolean;
    font_start?: number;
    font_end?: number;
    easing?: string;
}

/**
 * Tween 封装（TweenUtil）
 */

export class TweenUtil {
    /**
     * 相对位移 tween.by
     *
     * @param targetNode 目标节点
     * @param duration 时长（秒）
     * @param deltaPosition 位移增量
     * @param easing 缓动名，可 null
     * @param autoStart 是否立即 start
     * @param onComplete 结束回调，可 null
     * @returns Tween 实例
     */
    static moveBy(
        targetNode: Node,
        duration: number,
        deltaPosition: Vec3,
        easing: TweenEasingName,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
    ): NodeTween {
        let moveTween = tween(targetNode).by(duration, { position: deltaPosition }, { easing: easing });
        return onComplete && moveTween.call(onComplete), autoStart && moveTween.start(), moveTween;
    }

    /**
     * 绝对位移 tween.to
     *
     * @param targetNode 目标节点
     * @param duration 时长（秒）
     * @param targetPosition 目标坐标
     * @param easing 缓动名，可 null
     * @param autoStart 是否立即 start
     * @param onComplete 结束回调，可 null
     * @returns Tween 实例
     */
    static moveTo(
        targetNode: Node,
        duration: number,
        targetPosition: Vec3,
        easing: TweenEasingName,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
    ): NodeTween {
        let moveTween = tween(targetNode).to(duration, { position: targetPosition }, { easing: easing });
        return onComplete && moveTween.call(onComplete), autoStart && moveTween.start(), moveTween;
    }

    /**
     * 位移 + UIOpacity 渐变（parallel）
     *
     * @param targetNode 目标节点（需 UIOpacity）
     * @param duration 时长
     * @param targetPosition 目标坐标
     * @param opacityStart 起始透明度系数 0~1
     * @param opacityEnd 结束透明度系数 0~1
     * @param easing 位移缓动
     * @param autoStart 是否 start
     * @param onComplete 结束回调
     * @returns Tween 实例
     */
    static fadeMoveByEasing(
        targetNode: Node,
        duration: number,
        targetPosition: Vec3,
        opacityStart: number,
        opacityEnd: number,
        easing: TweenEasingName,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
    ): NodeTween {
        let movePart = tween(targetNode).to(duration, { position: targetPosition }, { easing: easing });
        let fadePart = tween(targetNode).to(duration, { position: targetPosition }, { onUpdate: (animTarget: Node, progressRatio: number) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * (opacityStart + (opacityEnd - opacityStart) * progressRatio);
            }, onComplete: (animTarget: Node) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * opacityEnd;
            }, onStart: (animTarget: Node) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * opacityStart;
            } });
        let combinedTween = tween(targetNode).parallel(movePart, fadePart);
        return onComplete && combinedTween.call(onComplete), autoStart && combinedTween.start(), combinedTween;
    }

    /**
     * 原地 UIOpacity 淡入/淡出
     *
     * @param targetNode 目标节点
     * @param duration 时长
     * @param opacityStart 起始系数
     * @param opacityEnd 结束系数
     * @param autoStart 是否 start
     * @param onComplete 结束回调
     * @returns Tween 实例
     */
    static fadeInOrOut(
        targetNode: Node,
        duration: number,
        opacityStart: number,
        opacityEnd: number,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
    ): NodeTween {
        let fadeTween = tween(targetNode).to(duration, { position: targetNode.getPosition() }, { onUpdate: (animTarget: Node, progressRatio: number) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * (opacityStart + (opacityEnd - opacityStart) * progressRatio);
            }, onComplete: (animTarget: Node) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * opacityEnd;
            }, onStart: (animTarget: Node) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * opacityStart;
            } });
        return onComplete && fadeTween.call(onComplete), autoStart && fadeTween.start(), fadeTween;
    }

    /**
     * 缩放 + 透明度 parallel
     *
     * @param targetNode 目标节点
     * @param duration 时长
     * @param targetScale 目标 scale
     * @param opacityStart 起始透明度系数
     * @param opacityEnd 结束透明度系数
     * @param easing 缩放缓动
     * @param autoStart 是否 start
     * @param onComplete 结束回调
     * @returns Tween 实例
     */
    static fadeScaleByEasing(
        targetNode: Node,
        duration: number,
        targetScale: Vec3,
        opacityStart: number,
        opacityEnd: number,
        easing: TweenEasingName,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
    ): NodeTween {
        const basePosition = targetNode.getPosition();
        let scalePart = tween(targetNode).to(duration, { scale: targetScale }, { easing: easing });
        let fadePart = tween(targetNode).to(duration, { position: basePosition }, { onUpdate: (animTarget: Node, progressRatio: number) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * (opacityStart + (opacityEnd - opacityStart) * progressRatio);
            }, onComplete: (animTarget: Node) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * opacityEnd;
            }, onStart: (animTarget: Node) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * opacityStart;
            } });
        let combinedTween = tween(targetNode).parallel(scalePart, fadePart);
        return onComplete && combinedTween.call(onComplete), autoStart && combinedTween.start(), combinedTween;
    }

    /**
     * 位移同时插值 UIOpacity
     *
     * @param targetNode 目标节点
     * @param duration 时长
     * @param targetPosition 目标坐标
     * @param opacityStart 起始系数
     * @param opacityEnd 结束系数
     * @param autoStart 是否 start
     * @param onComplete 结束回调
     * @returns Tween 实例
     */
    static moveToByFade(
        targetNode: Node,
        duration: number,
        targetPosition: Vec3,
        opacityStart: number,
        opacityEnd: number,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
    ): NodeTween {
        let moveFadeTween = tween(targetNode).to(duration, { position: targetPosition }, { onUpdate: (animTarget: Node, progressRatio: number) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * (opacityStart + (opacityEnd - opacityStart) * progressRatio);
            }, onComplete: (animTarget: Node) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * opacityEnd;
            }, onStart: (animTarget: Node) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * opacityStart;
            } });
        return onComplete && moveFadeTween.call(onComplete), autoStart && moveFadeTween.start(), moveFadeTween;
    }

    /**
     * 闪烁 active（repeat）
     *
     * @param toggleNode 切换 active 的节点
     * @param repeatCount 重复次数
     * @param autoStart 是否 start
     * @param onComplete 结束回调
     * @param tweenHostNode 可选：tween 挂在该节点上，默认 toggleNode
     * @returns Tween 实例
     */
    static blink(
        toggleNode: Node,
        repeatCount: number,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
        tweenHostNode?: Node | null,
    ): NodeTween {
        let hostNode = toggleNode;
        sys.isObjectValid(tweenHostNode) && isValid(tweenHostNode, true) && (hostNode = tweenHostNode);
        let blinkTween = tween(hostNode).repeat(repeatCount, tween().call((() => toggleNode.active = !toggleNode.active)).delay(0.2));
        return onComplete && blinkTween.call(onComplete), autoStart && blinkTween.start(), blinkTween;
    }

    /**
     * 位移 + Sprite 颜色 alpha 插值
     */
    static moveSpriteByFade(
        targetNode: Node,
        duration: number,
        targetPosition: Vec3,
        alphaStart: number,
        alphaEnd: number,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
    ): NodeTween {
        let baseColor = targetNode.getComponent(Sprite).color;
        let moveTween = tween(targetNode).to(duration, { position: targetPosition }, { onUpdate: (animTarget: Node, progressRatio: number) => {
                animTarget.getComponent(Sprite).color = color(baseColor.r, baseColor.g, baseColor.b, alphaStart < alphaEnd ? 255 * (alphaStart + (alphaEnd - alphaStart) * progressRatio) : 255 * (alphaStart - (alphaStart - alphaEnd) * progressRatio));
            }, onComplete: (animTarget: Node) => {
                animTarget.getComponent(Sprite).color = color(baseColor.r, baseColor.g, baseColor.b, 255 * alphaEnd);
            }, onStart: (animTarget: Node) => {
                animTarget.getComponent(Sprite).color = color(baseColor.r, baseColor.g, baseColor.b, 255 * alphaStart);
            } });
        return onComplete && moveTween.call(onComplete), autoStart && moveTween.start(), moveTween;
    }

    /**
     * 位移 + Label 颜色 alpha 插值
     */
    static moveLabelByFade(
        targetNode: Node,
        duration: number,
        targetPosition: Vec3,
        alphaStart: number,
        alphaEnd: number,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
    ): NodeTween {
        let baseColor = targetNode.getComponent(Label).color;
        let moveTween = tween(targetNode).to(duration, { position: targetPosition }, { onUpdate: (animTarget: Node, progressRatio: number) => {
                animTarget.getComponent(Label).color = color(baseColor.r, baseColor.g, baseColor.b, alphaStart < alphaEnd ? 255 * (alphaStart + (alphaEnd - alphaStart) * progressRatio) : 255 * (alphaStart - (alphaStart - alphaEnd) * progressRatio));
            }, onComplete: (animTarget: Node) => {
                animTarget.getComponent(Label).color = color(baseColor.r, baseColor.g, baseColor.b, 255 * alphaEnd);
            }, onStart: (animTarget: Node) => {
                animTarget.getComponent(Label).color = color(baseColor.r, baseColor.g, baseColor.b, 255 * alphaStart);
            } });
        return onComplete && moveTween.call(onComplete), autoStart && moveTween.start(), moveTween;
    }

    /**
     * Legacy 拼写：Label 颜色渐变（scale 占位 tween）
     *
     * @param targetNode 带 Label 的节点
     * @param duration 时长
     * @param colorStart 起始 Color
     * @param colorEnd 结束 Color
     * @param autoStart 是否 start
     * @param onComplete 结束回调
     */
    static gradientLableColor(
        targetNode: Node,
        duration: number,
        colorStart: Color,
        colorEnd: Color,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
    ): void {
        const baseScale = targetNode.getScale();
        let colorTween = tween(targetNode).to(duration, { scale: baseScale }, { onUpdate: (animTarget: Node, progressRatio: number) => {
                let red = colorStart.r + (colorEnd.r - colorStart.r) * progressRatio;
                let green = colorStart.g + (colorEnd.g - colorStart.g) * progressRatio;
                let blue = colorStart.b + (colorEnd.b - colorStart.b) * progressRatio;
                let alpha = colorStart.a + (colorEnd.a - colorStart.a) * progressRatio;
                animTarget.getComponent(Label).color = new Color(red, green, blue, alpha);
            }, onComplete: (animTarget: Node) => {
                animTarget.getComponent(Label).color = colorEnd;
            }, onStart: (animTarget: Node) => {
                animTarget.getComponent(Label).color = colorStart;
            } });
        onComplete && colorTween.call(onComplete);
        autoStart && colorTween.start();
    }

    /** 相对缩放 tween.by */
    static scaleBy(
        targetNode: Node,
        duration: number,
        deltaScale: Vec3,
        easing: TweenEasingName,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
    ): NodeTween {
        let scaleTween = tween(targetNode).by(duration, { scale: deltaScale }, { easing: easing });
        return onComplete && scaleTween.call(onComplete), autoStart && scaleTween.start(), scaleTween;
    }

    /** 绝对缩放 tween.to */
    static scaleTo(
        targetNode: Node,
        duration: number,
        targetScale: Vec3,
        easing: TweenEasingName,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
    ): NodeTween {
        let scaleTween = tween(targetNode).to(duration, { scale: targetScale }, { easing: easing });
        return onComplete && scaleTween.call(onComplete), autoStart && scaleTween.start(), scaleTween;
    }

    /** 相对旋转 tween.by */
    static rotateBy(
        targetNode: Node,
        duration: number,
        deltaEuler: Vec3,
        easing: TweenEasingName,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
    ): NodeTween {
        let rotateTween = tween(targetNode).by(duration, { eulerAngles: deltaEuler }, { easing: easing });
        return onComplete && rotateTween.call(onComplete), autoStart && rotateTween.start(), rotateTween;
    }

    /** 绝对旋转 tween.to */
    static rotateTo(
        targetNode: Node,
        duration: number,
        targetEuler: Vec3,
        easing: TweenEasingName,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
    ): NodeTween {
        let rotateTween = tween(targetNode).to(duration, { eulerAngles: targetEuler }, { easing: easing });
        return onComplete && rotateTween.call(onComplete), autoStart && rotateTween.start(), rotateTween;
    }

    /**
     * 延迟后执行回调
     *
     * @param targetNode tween 绑定节点
     * @param callback 延迟后调用
     * @param delaySeconds 延迟秒数
     * @param autoStart 是否 start
     * @returns Tween 实例
     */
    static delayAct(
        targetNode: Node,
        callback: () => void,
        delaySeconds: number,
        autoStart: boolean,
    ): NodeTween {
        let delayTween = tween(targetNode).delay(delaySeconds).call(callback);
        return autoStart && delayTween.start(), delayTween;
    }

    /**
     * 顺序播放多个 tween 片段
     *
     * @param targetNode 绑定节点
     * @param autoStart 是否 start
     * @param onComplete 序列结束回调
     * @param tweenSteps 子 tween（可变参）
     * @returns Tween 实例
     */
    static sequence(
        targetNode: Node,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
        ...tweenSteps: Tween<Node>[]
    ): NodeTween {
        let seqTween = tween(targetNode).sequence(...tweenSteps);
        return onComplete && seqTween.call(onComplete), autoStart && seqTween.start(), seqTween;
    }

    /**
     * 并行播放多个 tween 片段
     */
    static parallel(
        targetNode: Node,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
        ...tweenSteps: Tween<Node>[]
    ): NodeTween {
        let parTween = tween(targetNode).parallel(...tweenSteps);
        return onComplete && parTween.call(onComplete), autoStart && parTween.start(), parTween;
    }

    /**
     * 节点 show/hide 交替闪烁（无限）
     *
     * @param targetNode 目标节点
     * @param blinkInterval 单次间隔，默认 0.1
     * @returns 已 start 的 Tween
     */
    static flicker(targetNode: Node, blinkInterval?: number): NodeTween {
        let interval = blinkInterval || 0.1;
        let flickerTween = tween(targetNode).delay(interval).hide().delay(interval).show().union().repeatForever();
        return flickerTween.start(), flickerTween;
    }

    /**
     * 往返透明度呼吸（repeatForever）
     */
    static flickerOpacity(
        targetNode: Node,
        holdPosition: Vec3,
        opacityLow: number,
        opacityHigh: number,
        duration: number,
    ): NodeTween {
        let fadeUpTween = tween(targetNode).to(duration, { position: holdPosition }, { onUpdate: (animTarget: Node, progressRatio: number) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * (opacityLow + (opacityHigh - opacityLow) * progressRatio);
            }, onComplete: (animTarget: Node) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * opacityHigh;
            }, onStart: (animTarget: Node) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * opacityLow;
            } });
        let fadeDownTween = tween(targetNode).to(duration, { position: holdPosition }, { onUpdate: (animTarget: Node, progressRatio: number) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * (opacityHigh - (opacityHigh - opacityLow) * progressRatio);
            }, onComplete: (animTarget: Node) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * opacityLow;
            }, onStart: (animTarget: Node) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * opacityHigh;
            } });
        let loopTween = tween(targetNode).sequence(fadeUpTween, fadeDownTween).union().repeatForever();
        return loopTween.start(), loopTween;
    }

    /**
     * Legacy 拼写：位移同时插值 UITransform contentSize
     */
    static changeUItranform(
        targetNode: Node,
        targetPosition: Vec3,
        sizeStart: Size,
        sizeEnd: Size,
        duration: number,
        autoStart: boolean,
        onComplete: TweenCompleteFn,
    ): NodeTween {
        let resizeTween = tween(targetNode).to(duration, { position: targetPosition }, { onUpdate: (animTarget: Node, progressRatio: number) => {
                let width = sizeStart.width + (sizeEnd.width - sizeStart.width) * progressRatio;
                let height = sizeStart.height + (sizeEnd.height - sizeStart.height) * progressRatio;
                animTarget.getComponent(UITransform).setContentSize(size(width, height));
            }, onComplete: (animTarget: Node) => {
                animTarget.getComponent(UITransform).setContentSize(sizeEnd);
            }, onStart: (animTarget: Node) => {
                animTarget.getComponent(UITransform).setContentSize(sizeStart);
            } });
        return onComplete && resizeTween.call(onComplete), autoStart && resizeTween.start(), resizeTween;
    }

    /** 对已有 Tween 调用 repeatForever */
    static repeatForever(existingTween: Tween<Node>): void {
        existingTween.repeatForever();
    }

    /** 启动 Tween */
    static startAction(existingTween: Tween<Node>): void {
        existingTween.start();
    }

    /** 停止并清空引用（Legacy 赋 null） */
    static stopAction(existingTween: Tween<Node> | null | undefined): void {
        sys.isObjectValid(existingTween) && (existingTween.stop(), existingTween = null);
    }

    /** 立即 show 并 start */
    static show(targetNode: Node): NodeTween {
        let showTween = tween(targetNode).show();
        return showTween.start(), showTween;
    }

    /** 立即 hide 并 start */
    static hide(targetNode: Node): NodeTween {
        let hideTween = tween(targetNode).hide();
        return hideTween.start(), hideTween;
    }

    /** 停止目标节点上全部 Tween */
    static stopNodeAction(targetNode: Node): void {
        Tween.stopAllByTarget(targetNode);
    }

    /**
     * 按间隔秒数 tick（repeatForever，onUpdate 内累计）
     *
     * @param targetNode 绑定节点
     * @param intervalSeconds 间隔
     * @param tickCallback 每次触发
     * @returns 已 start 的 Tween
     */
    static myschedule(
        targetNode: Node,
        intervalSeconds: number,
        tickCallback?: (() => void) | null,
    ): NodeTween {
        let tickCounter = 1;
        let scheduleTween = tween(targetNode).to(1, { position: targetNode.getPosition() }, { onUpdate: (animTarget: Node, progressRatio: number) => {
                progressRatio >= intervalSeconds * tickCounter && (intervalSeconds < 1 && progressRatio > 0.9 ? 1 != tickCounter && (tickCounter += 1, tickCallback && tickCallback()) : (tickCounter += 1, tickCallback && tickCallback()));
            }, onComplete: (animTarget: Node) => {
                tickCounter = 100;
            }, onStart: (animTarget: Node) => {
                tickCounter = 1;
            } }).repeatForever();
        return scheduleTween.start(), scheduleTween;
    }

    /**
     * 综合淡入淡出 + 可选字号（fadeInOut 配置对象）
     *
     * @param targetNode 目标节点
     * @param fadeOptions target_position、fadeStart、fadeEnd、duration、font_change 等
     * @returns 已 start 的 Tween
     */
    static fadeInOut(targetNode: Node, fadeOptions: TweenFadeInOutOptions): NodeTween {
        let targetPosition = fadeOptions.target_position;
        let fadeStart = fadeOptions.fadeStart;
        let fadeEnd = fadeOptions.fadeEnd;
        let duration = fadeOptions.duration;
        let fontChange = fadeOptions.font_change;
        let fontStart = fadeOptions.font_start;
        let fontEnd = fadeOptions.font_end;
        let easingName = fadeOptions.easing;
        let fadeTween = tween(targetNode).to(duration, { position: targetPosition, easing: easingName }, { onUpdate: (animTarget: Node, progressRatio: number) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * (fadeStart + (fadeEnd - fadeStart) * progressRatio);
                fontChange && (targetNode.getComponent(Label).fontSize = fontStart + (fontEnd - fontStart) * progressRatio);
            }, onComplete: (animTarget: Node) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * fadeEnd;
                fontChange && (targetNode.getComponent(Label).fontSize = fontEnd);
            }, onStart: (animTarget: Node) => {
                animTarget.getComponent(UIOpacity).opacity = 255 * fadeStart;
                fontChange && (targetNode.getComponent(Label).fontSize = fontStart);
            } });
        return fadeTween.start(), fadeTween;
    }

    /**
     * 每 periodSeconds 触发一次 tickCallback（repeatForever）
     *
     * @param targetNode 绑定节点
     * @param periodSeconds 周期
     * @param tickCallback 回调，参数为 targetNode
     * @returns 已 start 的 Tween
     */
    static commonSchedule(
        targetNode: Node,
        periodSeconds: number,
        tickCallback?: ((node: Node) => void) | null,
    ): NodeTween {
        let scheduleTween = tween(targetNode).to(periodSeconds, { position: targetNode.getPosition() }, { onUpdate: (animTarget: Node, progressRatio: number) => {
            }, onComplete: (animTarget: Node) => {
                tickCallback && tickCallback(targetNode);
            }, onStart: (animTarget: Node) => {
            } }).repeatForever();
        return scheduleTween.start(), scheduleTween;
    }
}

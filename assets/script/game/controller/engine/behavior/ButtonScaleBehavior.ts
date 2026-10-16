// // @ts-nocheck
// // Recovered from index.js:55
// import { _decorator, Component, Button, lerp, Node, Vec3 } from "cc";
// import { NodeUtil } from "../../../../utility/NodeUtil";
// const { ccclass, property } = _decorator;
// @ccclass("ButtonScaleBehavior")
// export class ButtonScaleBehavior extends Component {
//     // 是否吞噬触摸事件（为 true 时阻止事件继续向父节点/其他节点传递）
//     @property({ tooltip: "Is the button Swallow" })
//     public swallowable: boolean = false;
//     // 是否启用缩放动画
//     @property({ tooltip: "Is the button scalable" })
//     public scaleable: boolean = true;
//     // 按下时放大的倍数（如 1.1 表示放大到原尺寸的 1.1 倍）
//     @property({ tooltip: "Button Zoom Size" })
//     public zoomScale: number = 1.1;
//     // 一次缩放过渡的时长（秒）
//     public duration: number = 0.1;
//     // 当前已播放的过渡时间（秒）
//     public time: number = 0;
//     // 按钮当前是否处于按下状态
//     public pressed: boolean = false;
//     // 缩放过渡的起始缩放值
//     public fromScale: Vec3 = new Vec3;
//     // 缩放过渡的目标缩放值
//     public toScale: Vec3 = new Vec3;
//     // 按钮的原始缩放值（在 start 时记录，作为还原基准）
//     public originalScale: Vec3 = new Vec3;
//     // 每帧计算出的临时目标缩放值
//     public targetScale: Vec3 = new Vec3;
//     // 当前缩放过渡是否已结束（true 表示无需继续 update）
//     public transitionFinished: boolean = true;

//     // 组件启动时记录按钮的初始缩放，作为还原基准
//     start() {
//         Vec3.copy(this.originalScale, this.node.getScale());
//     }

//     // 启用时注册触摸事件监听
//     onEnable() {
//         this.node.on(Node.EventType.TOUCH_START, this.onTouchBegan, this);
//         this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
//         this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
//         this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
//     }

//     // 禁用时移除触摸事件监听，避免内存泄漏或误操作
//     onDisable() {
//         this.node.off(Node.EventType.TOUCH_START, this.onTouchBegan, this);
//         this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
//         this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
//         this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
//     }

//     // 每帧推进缩放过渡动画
//     update(t) {
//         const i = this.node;
//         // 过渡已结束或节点无效则直接跳过
//         if (this.transitionFinished || !i) {
//             return;
//         }
//         // 累加经过的时间
//         this.time += t;
//         let e = 1;
//         // 计算过渡进度（0~1），duration 大于 0 才按比例计算
//         this.duration > 0 && (e = this.time / this.duration);
//         e >= 1 && (e = 1);
//         i.getScale(this.targetScale);
//         // 使用线性插值平滑地从 fromScale 过渡到 toScale
//         this.targetScale.x = lerp(this.fromScale.x, this.toScale.x, e);
//         this.targetScale.y = lerp(this.fromScale.y, this.toScale.y, e);
//         i.setScale(this.targetScale);
//         // 进度到达 1 时标记过渡完成，停止后续 update
//         1 === e && (this.transitionFinished = true);
//     }

//     // 手指按下：标记按下状态并触发缩放过渡
//     onTouchBegan(t) {
//         NodeUtil.IsValid(this.node) && (this.swallowable && (t.preventSwallow = true), this.pressed = true, this.updateScaleTransition());
//     }

//     // 手指移动：若仍在按钮范围内则保持放大，移出范围则还原
//     onTouchMove(t) {
//         let i = this.node.getComponent(Button);
//         if (i && i.interactable && (this.swallowable && (t.preventSwallow = true), this.scaleable && i.transition != Button.Transition.SCALE)) {
//             const i = t.touch;
//             if (i) {
//                 // 通过命中测试判断手指是否仍停留在按钮区域内
//                 this.node._uiProps.uiTransformComp.hitTest(i.getLocation()) ? NodeUtil.IsValid(this.node) && (Vec3.copy(this.fromScale, this.originalScale), Vec3.multiplyScalar(this.toScale, this.originalScale, this.zoomScale), this.transitionFinished = false) : NodeUtil.IsValid(this.node) && (this.time = 0, this.transitionFinished = true, this.node.setScale(this.originalScale));
//             }
//         }
//     }

//     // 手指抬起：释放按下状态，触发还原缩放
//     onTouchEnd(t) {
//         NodeUtil.IsValid(this.node) && (this.swallowable && (t.preventSwallow = true), this.pressed = false, this.updateScaleTransition());
//     }

//     // 触摸被取消（如来电、手势打断）：同抬起处理，还原缩放
//     onTouchCancel(t) {
//         NodeUtil.IsValid(this.node) && (this.swallowable && (t.preventSwallow = true), this.pressed = false, this.updateScaleTransition());
//     }

//     // 根据按下状态决定放大还是还原（仅在按钮可交互、未使用原生 SCALE 过渡、允许缩放时生效）
//     updateScaleTransition() {
//         if (NodeUtil.IsValid(this.node)) {
//             let t = this.node.getComponent(Button);
//             t && t.interactable && this.scaleable && t.transition != Button.Transition.SCALE && (this.pressed ? this.zoomUp() : this.zoomBack());
//         }
//     }

//     // 放大：从原始缩放过渡到 放大后的缩放值
//     zoomUp() {
//         this.originalScale && (Vec3.copy(this.fromScale, this.originalScale), Vec3.multiplyScalar(this.toScale, this.originalScale, this.zoomScale), this.time = 0, this.transitionFinished = false);
//     }

//     // 还原：从当前缩放过渡回原始缩放值
//     zoomBack() {
//         this.node && this.originalScale && (Vec3.copy(this.fromScale, this.node.getScale()), Vec3.copy(this.toScale, this.originalScale), this.time = 0, this.transitionFinished = false);
//     }
// }

// // @ts-nocheck
// // Recovered from index.js:501
// import { _decorator, Component, isValid, Rect, ScrollView, UITransform, Vec3 } from "cc";
// import { LogKit } from "../../../3rd/qframework/toolkits/coreKit/logKit/LogKit";
// const { ccclass, property } = _decorator;
// @ccclass("ScrollVisibilityBehavior")
// export default class ScrollVisibilityBehavior extends Component {
//     public TAG: string = "ScrollVisibilityBehavior";
//     @property(ScrollView)
//     public scrollView: ScrollView = null;
//     @property
//     public bufferZone: number = 300;
//     @property
//     public dealType: number = 0;
//     @property
//     public minScrollDistance: number = 10;
//     public content: any = undefined;
//     public view: any = undefined;
//     public visibleBox: any = undefined;
//     public lastContentPos: Vec3 = new Vec3;
//     onLoad() {
//         if (!isValid(this.scrollView, true)) {
//             return void LogKit.E(this.TAG, "ScrollVisibilityBehavior: Please set scrollView");
//         }
//         this.content = this.scrollView.content;
//         this.view = this.scrollView.node;
//         let i = this.view.getComponent(UITransform), t = i.convertToWorldSpaceAR(Vec3.ZERO), e = i.contentSize.width, o = i.contentSize.height, s = i.anchorX, n = i.anchorY;
//         this.visibleBox = new Rect(t.x - e * s, t.y - o * n, e, o);
//         this.visibleBox.yMin -= this.bufferZone;
//         this.visibleBox.yMax += this.bufferZone;
//         this.visibleBox.xMin -= this.bufferZone;
//         this.visibleBox.xMax += this.bufferZone;
//         this.lastContentPos.set(this.scrollView.content.position);
//         this.updateVisibility();
//     }
//     onEnable() {
//         this.updateVisibility();
//         isValid(this.scrollView, true) && (this.scrollView.node.on(ScrollView.EventType.SCROLLING, this.onScrolling, this), this.scrollView.node.on(ScrollView.EventType.SCROLL_ENDED, this.updateVisibility, this));
//     }
//     onDisable() {
//         isValid(this.scrollView, true) && (this.scrollView.node.off(ScrollView.EventType.SCROLLING, this.onScrolling, this), this.scrollView.node.off(ScrollView.EventType.SCROLL_ENDED, this.updateVisibility, this));
//     }
//     onScrolling() {
//         const i = this.scrollView.content.position;
//         Vec3.distance(i, this.lastContentPos) >= this.minScrollDistance && (this.updateVisibility(), this.lastContentPos.set(i));
//     }
//     updateVisibility() {
//         if (isValid(this.scrollView, true) && isValid(this.content, true) && isValid(this.view, true)) {
//             if (0 == this.dealType) {
//                 for (let i of this.content.children) {
//                     if (!isValid(i, true)) {
//                         continue;
//                     }
//                     let t = i.getComponent(UITransform).getBoundingBoxToWorld().intersects(this.visibleBox);
//                     i.active != t && (i.active = t);
//                 }
//             }
//             else {
//                 for (let i of this.content.children) {
//                     if (isValid(i, true) && isValid(i.children) && 0 !== i.children.length && i.active) {
//                         for (let t of i.children) {
//                             if (!isValid(t, true)) {
//                                 continue;
//                             }
//                             let i = t.getComponent(UITransform).getBoundingBoxToWorld().intersects(this.visibleBox);
//                             t.active != i && (t.active = i);
//                         }
//                     }
//                 }
//             }
//         }
//     }
// }

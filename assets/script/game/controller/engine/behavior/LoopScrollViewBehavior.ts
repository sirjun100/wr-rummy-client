// // @ts-nocheck
// // Recovered from index.js:259
// import { _decorator, Component, color, instantiate, isValid, Label, Node, sys, tween, UIOpacity, UITransform, v3 } from "cc";
// import { LogKit } from "../../../3rd/qframework/toolkits/coreKit/logKit/LogKit";
// import SoundManager from "../../service/SoundManager";
// import BundleNameDefined from "../../config/BundleNameDefined";
// const { ccclass, property } = _decorator;
// const A = 0.05;
// @ccclass("LoopScrollViewBehavior")
// export default class LoopScrollViewBehavior extends Component {
//     @property({ tooltip: "scrollview item node", type: Node })
//     public item: Node = null;
//     @property({ tooltip: "scrollview parent node", type: Node })
//     public content: Node = null;
//     @property({ tooltip: "show item num" })
//     public showItemNum: number = 5;
//     @property({ tooltip: "inertiaScale 0~1" })
//     public inertiaScale: number = 0.5;
//     public _touchId: any = null;
//     public _startPosY: number = 0;
//     public _lastPos: any = null;
//     public _scrollItem: any[] = [];
//     public _centerItemIndex: number = 0;
//     public _dataList: any[] = [];
//     public _dataIndex: number = 0;
//     public _selectIndex: number = 0;
//     public _scrollSpeed: number = 0;
//     public _startTouchTime: number = 0;
//     public _startMove: boolean = false;
//     public _startAutoMove: boolean = false;
//     public _isLoopScroll: boolean = true;
//     public _scrollBiggestLength: number = 0;
//     onLoad() {
//         this.item.active = false;
//         this.inertiaScale < 0 ? this.inertiaScale = 0 : this.inertiaScale > 1 && (this.inertiaScale = 1);
//     }
//     registerTouchEvent() {
//         sys.isObjectValid(this.content) && (this.content.on(Node.EventType.TOUCH_START, this.onEventStart, this), this.content.on(Node.EventType.TOUCH_END, this.onEventEnd, this), this.content.on(Node.EventType.TOUCH_MOVE, this.onEventMove, this), this.content.on(Node.EventType.TOUCH_CANCEL, this.onEventCancel, this));
//     }
//     start() {
//         SoundManager.shared().preLoadBundleSounds(BundleNameDefined.bundle_sound, "select");
//         this.registerTouchEvent();
//         this._startPosY = this.content.getComponent(UITransform).height / 2 + this.item.getComponent(UITransform).height / 2;
//         this._centerItemIndex = Math.floor((this.showItemNum + 2) / 2);
//         this.init();
//     }
//     onEnable() {
//         this.registerTouchEvent();
//     }
//     onDisable() {
//         sys.isObjectValid(this.content) && (this.content.off(Node.EventType.TOUCH_START, this.onEventStart, this), this.content.off(Node.EventType.TOUCH_END, this.onEventEnd, this), this.content.off(Node.EventType.TOUCH_MOVE, this.onEventMove, this), this.content.off(Node.EventType.TOUCH_CANCEL, this.onEventCancel, this));
//     }
//     update(t) {
//         for (let t = 0, e = this._scrollItem.length; t < e; t++) {
//             const e = this._scrollItem[t];
//             this.updateItemVal(e);
//         }
//         this._scrollSpeed > 0 ? (this._scrollSpeed -= 0.48 * t, this._scrollSpeed <= 0 && (this._scrollSpeed = 0)) : this._scrollSpeed < 0 ? (this._scrollSpeed += 0.48 * t, this._scrollSpeed >= 0 && (this._scrollSpeed = 0)) : this._startMove && (this.scrollEnd(), this._startMove = false);
//         0 !== this._scrollSpeed && this.scrollMove(this._scrollSpeed * t * 1000);
//     }
//     onEventStart(t) {
//         t.getID() != this._touchId && null != this._touchId || this._startAutoMove || (this._touchId = t.getID(), this._lastPos = t.getLocation(), this._startTouchTime = (new Date).getTime(), this._scrollSpeed = 0);
//     }
//     onEventEnd(t) {
//         if (t.getID() != this._touchId) {
//             return;
//         }
//         if (this._startAutoMove) {
//             return;
//         }
//         this._touchId = null;
//         let e = t.getLocation(), i = t.getStartLocation();
//         this._scrollSpeed = (e.y - i.y) / ((new Date).getTime() - this._startTouchTime);
//         this._scrollSpeed > 1.4 ? this._scrollSpeed = 1.4 : this._scrollSpeed < -1.4 && (this._scrollSpeed = -1.4);
//         this._scrollSpeed *= this.inertiaScale;
//         this._startMove = true;
//     }
//     onEventMove(t) {
//         t.getID() == this._touchId && (this._startAutoMove || (this.scrollMove(t.getLocation().y - this._lastPos.y), this._lastPos = t.getLocation()));
//     }
//     onEventCancel(t) {
//         if (t.getID() != this._touchId) {
//             return;
//         }
//         if (this._startAutoMove) {
//             return;
//         }
//         this._touchId = null;
//         let e = t.getLocation(), i = t.getStartLocation();
//         this._scrollSpeed = (e.y - i.y) / ((new Date).getTime() - this._startTouchTime);
//         this._scrollSpeed > 1.4 ? this._scrollSpeed = 1.4 : this._scrollSpeed < -1.4 && (this._scrollSpeed = -1.4);
//         this._scrollSpeed *= this.inertiaScale;
//         this._startMove = true;
//     }
//     init() {
//         for (let t = 0, e = this.showItemNum + 2; t < e; t++) {
//             let e = instantiate(this.item);
//             e.name = "item_" + t;
//             e.active = true;
//             e.parent = this.content;
//             e.setPosition(v3(0, this._startPosY - t * this.item.getComponent(UITransform).height, 0));
//             this._scrollItem[this._scrollItem.length] = e;
//             this.updateItem(t, e);
//         }
//     }
//     initData(t, e, i = 0, s = true) {
//         t && 0 !== t.length || LogKit.E("LoopScrollViewBehavior.initData:", "dataList is null");
//         (i < 0 || i >= t.length) && LogKit.E("LoopScrollViewBehavior.initData:", "The startIndex value is incorrect and should be within the length range of the data list");
//         this._dataList = t;
//         this._dataIndex = i;
//         this._selectIndex = i;
//         this._onUpdateItem = e;
//         this._isLoopScroll = s;
//         this._dataList.length <= this.showItemNum && (this._isLoopScroll = false);
//     }
//     updateData(t, e = 0, i = true) {
//         this._dataList = t;
//         this._dataIndex = e;
//         this._selectIndex = e;
//         this._isLoopScroll = i;
//         this._dataList.length <= this.showItemNum && (this._isLoopScroll = false);
//         for (let t = 0, e = this._scrollItem.length; t < e; t++) {
//             let e = this._scrollItem[t];
//             e && isValid(e, true) && this.updateItem(t, e);
//         }
//     }
//     scrollMove(t) {
//         let e = t;
//         for (; e > 5;) {
//             this.moveItem(t, 5);
//             e -= 5;
//         }
//         this.moveItem(t, e);
//     }
//     moveItem(t, e) {
//         if (this._isLoopScroll) {
//             for (let t = 0, i = this._scrollItem.length; t < i; t++) {
//                 const i = this._scrollItem[t];
//                 i.setPosition(i.position.x, i.position.y + e);
//             }
//             t > 0 ? this._scrollItem[this._centerItemIndex + 1].position.y >= 0 && this.changeItem(t, this._scrollItem[this._centerItemIndex + 1].position.y) : this._scrollItem[this._centerItemIndex - 1].position.y <= 0 && this.changeItem(t, this._scrollItem[this._centerItemIndex - 1].position.y);
//         }
//         else {
//             if (0 === this._dataIndex && t <= 0 || this._dataIndex === this._dataList.length - 1 && t >= 0) {
//                 if (this._scrollSpeed = 0, this._scrollItem[this._centerItemIndex].position.y > -this._scrollBiggestLength && this._scrollItem[this._centerItemIndex].position.y < this._scrollBiggestLength) {
//                     for (let t = 0, i = this._scrollItem.length; t < i; t++) {
//                         const i = this._scrollItem[t];
//                         i.setPosition(i.position.x, i.position.y + e);
//                     }
//                 }
//                 return;
//             }
//             for (let t = 0, i = this._scrollItem.length; t < i; t++) {
//                 const i = this._scrollItem[t];
//                 i.setPosition(i.position.x, i.position.y + e);
//             }
//             t > 0 ? this._scrollItem[this._centerItemIndex + 1].position.y >= 0 && this.changeItem(t, this._scrollItem[this._centerItemIndex + 1].position.y) : this._scrollItem[this._centerItemIndex - 1].position.y <= 0 && this.changeItem(t, this._scrollItem[this._centerItemIndex - 1].position.y);
//         }
//     }
//     changeItem(t, e) {
//         if (t > 0) {
//             let t = this._scrollItem.shift();
//             this._scrollItem[this._scrollItem.length] = t;
//             t.setPosition(t.position.x, this._startPosY - (this._scrollItem.length - 1) * this.item.getComponent(UITransform).height + e);
//             this._dataIndex++;
//             this._dataIndex >= this._dataList.length && (this._dataIndex = 0);
//             this.updateItem(this._scrollItem.length - 1, t);
//         }
//         else {
//             let t = this._scrollItem.pop();
//             this._scrollItem.splice(0, 0, t);
//             t.setPosition(t.position.x, this._startPosY + e);
//             this._dataIndex--;
//             this._dataIndex < 0 && (this._dataIndex = this._dataList.length - 1);
//             this.updateItem(0, t);
//         }
//     }
//     updateItem(t, e) {
//         let i = t - this._centerItemIndex + this._dataIndex;
//         this._isLoopScroll && (i < 0 ? i += this._dataList.length : i >= this._dataList.length && (i -= this._dataList.length));
//         null == this._dataList[i] ? e.active = false : (e.active = true, e.getComponent(Label).string = this._dataList[i]);
//         this._onUpdateItem && this._selectIndex != this._dataIndex && (this._onUpdateItem(this._dataIndex, this._dataList[this._dataIndex]), this._selectIndex = this._dataIndex, this.playSoundAndVibration());
//     }
//     updateItemVal(t) {
//         let e = t.position.y;
//         e > this._startPosY ? e = this._startPosY : e < -this._startPosY && (e = -this._startPosY);
//         t.eulerAngles = v3(e / this._startPosY * 45, 0, 0);
//         t.getComponent(UIOpacity).opacity = 255 - Math.abs(e);
//         t.scale = v3(1 - 0.3 * Math.abs(e / this._startPosY), 1 - 0.3 * Math.abs(e / this._startPosY));
//         t.getComponent(Label).color = color(49 + 151 * Math.abs(e / this._startPosY), 49 + 151 * Math.abs(e / this._startPosY), 49 + 151 * Math.abs(e / this._startPosY));
//     }
//     scrollEnd() {
//         this._startAutoMove = true;
//         let t = this.item.getComponent(UITransform).height - Math.abs(this._scrollItem[this._centerItemIndex].position.y);
//         if (this._isLoopScroll) {
//             if (this._scrollItem[this._centerItemIndex].position.y > this.item.getComponent(UITransform).height / 2) {
//                 for (let e = 0, i = this._scrollItem.length; e < i; e++) {
//                     const s = this._scrollItem[e];
//                     e === i - 1 ? tween(s).to(A, { position: v3(s.position.x, s.position.y + t, s.position.z) }).call((() => {
//                         this.changeItem(1, 0);
//                         this._startAutoMove = false;
//                     })).start() : tween(s).to(A, { position: v3(s.position.x, s.position.y + t, s.position.z) }).start();
//                 }
//             }
//             else if (this._scrollItem[this._centerItemIndex].position.y < -this.item.getComponent(UITransform).height / 2) {
//                 for (let e = 0, i = this._scrollItem.length; e < i; e++) {
//                     const s = this._scrollItem[e];
//                     e === i - 1 ? tween(s).to(A, { position: v3(s.position.x, s.position.y - t, s.position.z) }).call((() => {
//                         this.changeItem(-1, 0);
//                         this._startAutoMove = false;
//                     })).start() : tween(s).to(A, { position: v3(s.position.x, s.position.y - t, s.position.z) }).start();
//                 }
//             }
//             else {
//                 for (let t = 0, e = this._scrollItem.length; t < e; t++) {
//                     const i = this._scrollItem[t];
//                     t === e - 1 ? tween(i).to(A, { position: v3(i.position.x, i.position.y - this._scrollItem[this._centerItemIndex].position.y, i.position.z) }).call((() => {
//                         this._startAutoMove = false;
//                     })).start() : tween(i).to(A, { position: v3(i.position.x, i.position.y - this._scrollItem[this._centerItemIndex].position.y, i.position.z) }).start();
//                 }
//             }
//         }
//         else if (this._scrollItem[this._centerItemIndex].position.y > this.item.getComponent(UITransform).height / 2 && this._dataIndex < this._dataList.length - 1) {
//             for (let e = 0, i = this._scrollItem.length; e < i; e++) {
//                 const s = this._scrollItem[e];
//                 e === i - 1 ? tween(s).to(A, { position: v3(s.position.x, s.position.y + t, s.position.z) }).call((() => {
//                     this.changeItem(1, 0);
//                     this._startAutoMove = false;
//                 })).start() : tween(s).to(A, { position: v3(s.position.x, s.position.y + t, s.position.z) }).start();
//             }
//         }
//         else if (this._scrollItem[this._centerItemIndex].position.y < -this.item.getComponent(UITransform).height / 2 && this._dataIndex > 0) {
//             for (let e = 0, i = this._scrollItem.length; e < i; e++) {
//                 const s = this._scrollItem[e];
//                 e === i - 1 ? tween(s).to(A, { position: v3(s.position.x, s.position.y - t, s.position.z) }).call((() => {
//                     this.changeItem(-1, 0);
//                     this._startAutoMove = false;
//                 })).start() : tween(s).to(A, { position: v3(s.position.x, s.position.y - t, s.position.z) }).start();
//             }
//         }
//         else {
//             for (let t = 0, e = this._scrollItem.length; t < e; t++) {
//                 const i = this._scrollItem[t];
//                 t === e - 1 ? tween(i).to(A, { position: v3(i.position.x, i.position.y - this._scrollItem[this._centerItemIndex].position.y, i.position.z) }).call((() => {
//                     this._startAutoMove = false;
//                 })).start() : tween(i).to(A, { position: v3(i.position.x, i.position.y - this._scrollItem[this._centerItemIndex].position.y, i.position.z) }).start();
//             }
//         }
//     }
//     playSoundAndVibration() {
//         SoundManager.shared().playFx("select_time");
//     }
// }

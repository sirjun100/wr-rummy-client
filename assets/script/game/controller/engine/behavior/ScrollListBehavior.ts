// // @ts-nocheck
// // Recovered from index.js:499
// import { _decorator, Component, Node, ScrollView, sys, UITransform } from "cc";
// import { NodeUtil } from "../../../../utility/NodeUtil";
// const { ccclass } = _decorator;
// @ccclass("ScrollListBehavior")
// export class ScrollListBehavior extends Component {
//     public _isScrolling: boolean = false;
//     public _listData: any = null;
//     public _scrollview: any = null;
//     public _itemHei: number = 0;
//     public _scrollHei: number = 0;
//     public _scrollcallback: any = null;
//     public _scrollType: number = 0;
//     public _itemNum: number = 0;
//     public freshDistance: number = 0;
//     public freshTableFunc: any = null;
//     public b_refresh: boolean = false;
//     public has_load_more: boolean = false;
//     public contentHei: number = 0;
//     public last_show_index: number = 0;
//     start() {
//     }
//     registerTouchEvent() {
//         sys.isObjectValid(this._scrollview) && (this._scrollview.node.on(Node.EventType.TOUCH_START, this.onTouchBegan, this), this._scrollview.node.on(ScrollView.EventType.SCROLL_BEGAN, this.srollviewCallback, this), this._scrollview.node.on(ScrollView.EventType.SCROLLING, this.srollviewCallback, this), this._scrollview.node.on(ScrollView.EventType.SCROLL_ENDED, this.scrollviewEnd, this), this._scrollview.node.on(Node.EventType.TOUCH_END, this.scrollviewEnd, this), this._scrollview.node.on(Node.EventType.TOUCH_CANCEL, this.scrollviewEnd, this), this._scrollview.node.on(Node.EventType.MOUSE_LEAVE, this.scrollviewEnd, this));
//     }
//     onEnable() {
//         this.registerTouchEvent();
//     }
//     onDisable() {
//         sys.isObjectValid(this._scrollview) && (this._scrollview.node.off(Node.EventType.TOUCH_START, this.onTouchBegan, this), this._scrollview.node.off(ScrollView.EventType.SCROLL_BEGAN, this.srollviewCallback, this), this._scrollview.node.off(ScrollView.EventType.SCROLLING, this.srollviewCallback, this), this._scrollview.node.off(ScrollView.EventType.SCROLL_ENDED, this.scrollviewEnd, this), this._scrollview.node.off(Node.EventType.TOUCH_END, this.scrollviewEnd, this), this._scrollview.node.off(Node.EventType.TOUCH_CANCEL, this.scrollviewEnd, this), this._scrollview.node.off(Node.EventType.MOUSE_LEAVE, this.scrollviewEnd, this));
//     }
//     initScrollList(i) {
//         this._scrollview = i;
//         this.registerTouchEvent();
//     }
//     onTouchBegan(i) {
//         this.b_refresh = false;
//     }
//     setSrollCallBack(i) {
//         this._scrollcallback = i;
//     }
//     setScollDetails(i, t, s, l = false) {
//         this._listData = s;
//         this._itemHei = i;
//         this._scrollHei = t;
//         Array.isArray(s) && (this._itemNum = s.length);
//         this.onScolling(l);
//     }
//     setScollDetails2(i, t, s, l = false, e = 0, o = null) {
//         this._scrollType = i;
//         this._scrollHei = t;
//         this._itemNum = s;
//         this.freshDistance = e;
//         this.freshTableFunc = o;
//         this.contentHei = this._scrollview.content.getComponent(UITransform).height;
//         this.onScolling(l);
//     }
//     srollviewCallback(i) {
//         if (this._isScrolling = true, this.onScolling(this._isScrolling), this._scrollview.content.getComponent(UITransform).height > this._scrollHei) {
//             let i = this._scrollview.getScrollOffset().y;
//             this.b_refresh = false;
//             this._itemNum > 0 && this.freshTableFunc && i + this._scrollHei > this._scrollview.content.getComponent(UITransform).height + this.freshDistance && (this.b_refresh = true);
//         }
//     }
//     scrollviewEnd(i) {
//         this._isScrolling = false;
//         this.b_refresh && this.freshTableFunc && this.freshTableFunc();
//     }
//     onScolling(i) {
//         if (0 == this._scrollType) {
//             if (Array.isArray(this._listData) && this._listData.length > 0 && i) {
//                 let i = this._scrollview.content.children.length;
//                 if (i > 0) {
//                     for (let i = 0; i < this._listData.length; i++) {
//                         const t = this._scrollview.content.children[i];
//                         if (NodeUtil.IsValid(t)) {
//                             let s = false, l = this._scrollview.getScrollOffset().y;
//                             s = t.getPosition().y + l <= this._itemHei && t.getPosition().y + l >= -this._scrollHei;
//                             let e = !(t.active || !s);
//                             t.active = s;
//                             e && this._scrollcallback && this._scrollcallback(i);
//                         }
//                     }
//                     for (let t = this._listData.length; t < i; t++) {
//                         const i = this._scrollview.content.children[t];
//                         NodeUtil.IsValid(i) && (i.active = false);
//                     }
//                 }
//             }
//         }
//         else if ((1 == this._scrollType || 2 == this._scrollType) && this._itemNum > 0 && i) {
//             let i = this._scrollview.content.children.length;
//             if (i > 0) {
//                 this.last_show_index = 0;
//                 for (let i = 0; i < this._itemNum; i++) {
//                     const t = this._scrollview.content.children[i];
//                     if (NodeUtil.IsValid(t)) {
//                         let s = false, l = this._scrollview.getScrollOffset().y, e = t.getComponent(UITransform).height;
//                         t.getPosition().y + l <= e && t.getPosition().y + l >= -this._scrollHei ? (s = true, this.last_show_index = i) : s = false;
//                         let o = !(t.active || !s);
//                         t.active = s;
//                         o && this._scrollcallback && this._scrollcallback(i);
//                     }
//                 }
//                 2 == this._scrollType && (this.has_load_more || this.last_show_index == this._itemNum - 1 && (this.has_load_more = true, this.freshTableFunc && this.freshTableFunc(), setTimeout((() => {
//                     sys.isObjectValid(this) && this.isValid && (this.has_load_more = false);
//                 }), 1000)));
//                 for (let t = this._itemNum; t < i; t++) {
//                     const i = this._scrollview.content.children[t];
//                     NodeUtil.IsValid(i) && (i.active = false);
//                 }
//             }
//         }
//     }
//     update(i) {
//     }
// }

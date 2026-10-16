// // @ts-nocheck
// // Recovered from index.js:617
// import { _decorator, Component, game, instantiate, isValid, Node, ScrollView, sys, UITransform, v2, v3, Vec3 } from "cc";
// import { LogKit } from "../../../3rd/qframework/toolkits/coreKit/logKit/LogKit";
// import { NodeUtil } from "../../../../utility/NodeUtil";
// const { ccclass } = _decorator;
// @ccclass("TableViewBehavior")
// export default class TableViewBehavior extends Component {
//     public target: any = null;
//     public item: any[] = [];
//     public itemData: any[] = [];
//     public scrollView: any = null;
//     public itemInterval: number = 0;
//     public firstItemData: any = { startPos: 0, endPos: 0 };
//     public lastItemData: any = { startPos: 0, endPos: 0 };
//     public itemArr: any[] = [];
//     public itemNode: any[] = [];
//     public initItemData: any = undefined;
//     public itemPosMap: Map = new Map;
//     public firstItemIndex: any = undefined;
//     public lastItemIndex: any = undefined;
//     public content: any = undefined;
//     public layerHeight: any = undefined;
//     public itemCanMoveUp: any = undefined;
//     public itemCanMoveDown: any = undefined;
//     public lastTestTime: any = undefined;
//     public initCellFunc: any = null;
//     public freshDistance: number = 0;
//     public freshTableFunc: any = null;
//     public b_refresh: boolean = false;
//     public lastOffSet: any = v2();
//     public bIsAsync: boolean = false;
//     public itemHeightMap: Map = new Map;
//     public _itemHeight: any = undefined;
//     public _scrollcallback: any = null;
//     setSrollCallBack(t) {
//         this._scrollcallback = t;
//     }
//     setTarget(t) {
//         this.target = t;
//     }
//     registerTouchEvent() {
//         sys.isObjectValid(this.scrollView) && (this.scrollView.getComponent(ScrollView).node.on("scrolling", this.scrollEventCallback, this), this.scrollView.getComponent(ScrollView).node.on(Node.EventType.TOUCH_START, this.onTouchBegan, this), this.scrollView.getComponent(ScrollView).node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this), this.scrollView.getComponent(ScrollView).node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this), this.scrollView.getComponent(ScrollView).node.on(Node.EventType.MOUSE_LEAVE, this.onTouchEnd, this), this.scrollView.getComponent(ScrollView).node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this));
//     }
//     onEnable() {
//         this.registerTouchEvent();
//     }
//     onDisable() {
//         sys.isObjectValid(this.scrollView) && (this.scrollView.getComponent(ScrollView).node.off("scrolling", this.scrollEventCallback, this), this.scrollView.getComponent(ScrollView).node.off(Node.EventType.TOUCH_START, this.onTouchBegan, this), this.scrollView.getComponent(ScrollView).node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this), this.scrollView.getComponent(ScrollView).node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this), this.scrollView.getComponent(ScrollView).node.off(Node.EventType.MOUSE_LEAVE, this.onTouchEnd, this), this.scrollView.getComponent(ScrollView).node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this));
//     }
//     async init(t, e, i, s, h, o = 0, l = null, m = false) {
//         if (!arguments[0]) {
//             return LogKit.E("----------  tableview init param err! 1"), false;
//         }
//         if (null == typeof t || !isValid(e, true)) {
//             return LogKit.E("----------  tableview init param err! 2"), false;
//         }
//         this.initCellFunc = s;
//         this.itemData = t || [];
//         this.scrollView = e;
//         this.item = i;
//         this.itemInterval = h || 0;
//         null != l && (this.freshTableFunc = l, this.freshDistance = o);
//         this.content = this.scrollView.getComponent(ScrollView).content;
//         this.layerHeight = this.scrollView.getComponent(UITransform).contentSize.height;
//         this.firstItemIndex = 0;
//         this.lastItemIndex = 0;
//         this.firstItemData = { startPos: 0, endPos: 0 };
//         this.lastItemData = { startPos: 0, endPos: 0 };
//         this.itemArr = [];
//         this.itemNode = [];
//         this.itemPosMap.clear();
//         this.initItemData = true;
//         this.bIsAsync = m;
//         this.registerTouchEvent();
//         this.itemNode[0] = this.item[0];
//         this._itemHeight = this.itemNode[0].getComponent(UITransform).contentSize.height;
//         try {
//             this.bIsAsync ? await this.executePreFrame(this.GeneratorInitAllItem(), 0.01) : this.initAllItem();
//         }
//         catch (t) {
//             LogKit.E("TableViewBehavior,error2:", t);
//         }
//         this.getItemPos(0);
//         this.scrollView.getComponent(ScrollView).scrollToTop();
//     }
//     async reloadData(t, e = false) {
//         if (sys.isObjectValid(t) && Array.isArray(t)) {
//             if (!sys.isObjectValid(this.scrollView)) {
//                 return;
//             }
//             this.lastOffSet = this.scrollView.getComponent(ScrollView).getScrollOffset();
//             this.itemData = t;
//             try {
//                 this.bIsAsync ? await this.executePreFrame(this.GeneratorReInitAllItem(), 32) : this.reInitAllItem();
//             }
//             catch (t) {
//                 LogKit.E("TableViewBehavior,error1:", t);
//             }
//             if (this.reSortItems(), this.itemData.length > 0) {
//                 this.scrollView.getComponent(ScrollView).scrollToOffset(this.lastOffSet);
//                 let t = this.scrollView.getComponent(ScrollView).getScrollOffset().y;
//                 if (t >= 0) {
//                     let e, i;
//                     if (this.itemArr.length > this.itemData.length) {
//                         e = 0;
//                         i = this.itemData.length;
//                     }
//                     else {
//                         t = -t;
//                         let s = t - this.layerHeight;
//                         this.updateFirstItemIndex(t);
//                         this.itemCanMoveDown = true;
//                         this.updateLastItemIndex(s);
//                         this.itemCanMoveDown = false;
//                         e = this.firstItemIndex - 1;
//                         i = this.lastItemIndex + 1;
//                     }
//                     let s, h = 0, n = new Vec3;
//                     for (let t = e; t <= i && this.itemArr[h]; t++) {
//                         t >= 0 && t < this.itemData.length && (s = this.itemArr[h++], s.name = "index_" + String(t), s.active = true, this.setCellData(s, this.itemData[t], t), s.getPosition(n), s.setPosition(v3(n.x, this.itemPosMap.get(t).startPos, n.z)));
//                     }
//                     for (let t = h, e = this.itemData.length; this.itemArr[t] && t < e; t++) {
//                         s = this.itemArr[h++];
//                         s.name = "index_" + String(t);
//                         s.active = true;
//                         this.setCellData(s, this.itemData[t], t);
//                         s.getPosition(n);
//                         s.setPosition(v3(n.x, this.itemPosMap.get(t).startPos, n.z));
//                     }
//                     for (let t = h, e = this.itemArr.length; t < e; t++) {
//                         this.itemArr[t].active = false;
//                         this.itemArr[t].name = "index_-1";
//                         this.itemArr[t].getPosition(n);
//                         this.itemArr[t].setPosition(v3(n.x, 3000));
//                     }
//                 }
//                 this.updateContentSize();
//             }
//         }
//     }
//     addItemByData(t) {
//         this.getItemPos(this.itemData.length - 1);
//         let e = this.itemPosMap.get(this.itemData.length - 1).endPos;
//         if (e - this.layerHeight > 0) {
//             let t = e - this.layerHeight;
//             for (let e = this.itemData.length - 1; e >= 0; e--) {
//                 this.itemPosMap.get(e).endPos > t && this.itemPosMap.get(e).startPos <= t && (this.firstItemIndex = e);
//             }
//             this.scrollView.getComponent(ScrollView).scrollToBottom();
//             this.lastItemIndex = this.itemData.length - 1;
//             let i = this.firstItemIndex - 1 > 0 ? this.firstItemIndex - 1 : 0;
//             return this.itemMoveUp(i), true;
//         }
//         return this.firstItemIndex = 0, this.lastItemIndex = this.itemData.length - 1, this.itemMoveUp(this.firstItemIndex), false;
//     }
//     clearAllItem(t) {
//         if (!sys.isObjectValid(this.itemPosMap) || !sys.isObjectValid(this.scrollView)) {
//             return;
//         }
//         this.itemData = [];
//         this.itemPosMap.clear();
//         this.scrollView.getComponent(ScrollView).stopAutoScroll();
//         this.scrollView.getComponent(ScrollView).scrollToTop();
//         this.content.getComponent(UITransform).height = 0;
//         let e = new Vec3;
//         for (let i in this.itemArr) {
//             sys.isObjectValid(this.itemArr[i]) && (this.itemArr[i].active = false, this.itemArr[i].name = "index_-1", this.itemArr[i].getPosition(e), this.itemArr[i].setPosition(v3(e.x, 3000)), t && this.itemArr[i].destroy());
//         }
//         t && (this.itemArr = []);
//     }
//     deleteItem(t) {
//         let e = this.scrollView.getComponent(ScrollView).getScrollOffset(), i = this.itemData.length >= 0 ? this.itemData.length - 1 : 0;
//         this.getItemPos(i);
//         let s = -1, h = new Vec3;
//         for (let e = 0, i = this.itemArr.length; e < i; e++) {
//             if (this.itemArr[e].name === "index_" + String(t)) {
//                 this.itemArr[e].active = false;
//                 this.itemArr[e].name = "index_-1";
//                 this.itemArr[e].getPosition(h);
//                 this.itemArr[e].setPosition(v3(h.x, 3000));
//                 s = e;
//                 break;
//             }
//         }
//         if (s >= 0) {
//             this.reSortItems();
//             let i = new Vec3;
//             for (let e = 0, s = this.itemArr.length; e < s; e++) {
//                 let s = this.getIndexOfItem(this.itemArr[e]);
//                 s > t && (this.itemArr[e].name = "index_" + String(s - 1), this.itemArr[e].getPosition(i), this.itemArr[e].setPosition(v3(i.x, this.itemPosMap.get(s - 1).startPos)));
//             }
//             for (let t = 0, e = this.itemArr.length; t < e; t++) {
//                 let e = this.getIndexOfItem(this.itemArr[t]);
//                 e > -1 && e < this.itemData.length ? (this.itemArr[t].getPosition(i), this.itemArr[t].setPosition(v3(i.x, this.itemPosMap.get(e).startPos))) : (this.itemArr[t].active = false, this.itemArr[t].getPosition(i), this.itemArr[t].setPosition(v3(i.x, 3000)));
//             }
//             this.scrollView.getComponent(ScrollView).scrollToOffset(e, 0);
//         }
//     }
//     resetItemData(t, e) {
//         if (null != e && null != e) {
//             for (let i = 0, s = this.itemArr.length; i < s; i++) {
//                 if (this.getIndexOfItem(this.itemArr[i]) === t) {
//                     null != this.itemData[i] && null != this.itemData[i] && (this.itemData[i] = e, this.itemArr[i].active = true, this.setCellData(this.itemArr[i], this.itemData[i], i));
//                     break;
//                 }
//             }
//         }
//     }
//     setCellData(t, e, i) {
//         let s = this;
//         (async () => {
//             NodeUtil.IsValid(t) && s.initCellFunc && s.initCellFunc(t, e, i);
//         })();
//     }
//     resetItemSize(t, e) {
//         if (e > 0 && this.itemHeightMap.get(t) && this.itemHeightMap.get(t) == this._itemHeight + e) {
//             return;
//         }
//         (function (t, e) {
//             for (let [i, s] of this.itemPosMap.entries()) {
//                 i === t && (s.endPos += e);
//                 i > t && (s.endPos += e, s.startPos += e);
//             }
//             let i, s = new Vec3;
//             for (let e = 0, h = this.itemArr.length; e < h; e++) {
//                 i = this.getIndexOfItem(this.itemArr[e]);
//                 i > t && (this.itemArr[e].getPosition(s), this.itemArr[e].setPosition(v3(s.x, this.itemPosMap.get(i).startPos)));
//             }
//         }).bind(this)(t, -e);
//         e > 0 ? this.itemHeightMap.set(t, this._itemHeight + e) : this.itemHeightMap.set(t, this._itemHeight);
//         this.itemMoveUp(this.firstItemIndex);
//         let i = this.content.getComponent(UITransform).height + e;
//         this.updateContentHeigh(i);
//     }
//     updateData(t) {
//         this.itemData = t;
//     }
//     updateContentSize() {
//         this.content = this.scrollView.getComponent(ScrollView).content;
//         this.layerHeight = this.scrollView.getComponent(UITransform).contentSize.height;
//     }
//     getCellIndex(t) {
//         return sys.isObjectValid(t) ? this.getIndexOfItem(t) : -1;
//     }
//     getIndexCell(t) {
//         return sys.isObjectValid(t) ? this.getItemByIndex(t) : null;
//     }
//     getScrollOffset() {
//         return this.scrollView.getComponent(ScrollView).getScrollOffset();
//     }
//     setScrollOffset(t) {
//         this.scrollView.getComponent(ScrollView).scrollToOffset(t);
//     }
//     reSortItems() {
//         if (this.itemArr.length > 0) {
//             let t = this;
//             this.itemArr.sort(((e, i) => -1 == t.getIndexOfItem(e) ? -1 : t.getIndexOfItem(e) > t.getIndexOfItem(i) ? 1 : t.getIndexOfItem(e) < t.getIndexOfItem(i) ? -1 : 0));
//         }
//     }
//     getIndexOfItem(t) {
//         return Number(t.name.substring(6, t.name.length));
//     }
//     getItemByIndex(t) {
//         let e = null;
//         for (let i = 0, s = this.itemArr.length; i < s; i++) {
//             if (e = this.itemArr[i], null != e && null != e && this.getIndexOfItem(e) === t) {
//                 return e;
//             }
//         }
//         return null;
//     }
//     getPosIndex(t) {
//         for (let [e, i] of this.itemPosMap.entries()) {
//             if (i.endPos > t && i.startPos <= t) {
//                 return e;
//             }
//         }
//     }
//     getCurIndexItems() {
//         let t = -this.scrollView.getComponent(ScrollView).getScrollOffset().y, e = t - this.layerHeight, i = [];
//         for (let [s, h] of this.itemPosMap.entries()) {
//             let n = t <= h.startPos && t > h.endPos, o = e <= h.startPos && e > h.endPos;
//             n && (this.firstItemData.startPos = h.startPos, this.firstItemData.endPos = h.endPos, this.firstItemIndex = s, i[0] = s);
//             o && (this.lastItemData.startPos = h.startPos, this.lastItemData.endPos = h.endPos, this.lastItemIndex = s, i[1] = s);
//         }
//         return i;
//     }
//     getItemPos(t, e = 0, i) {
//         if (sys.isObjectValid(this.itemData) && 0 === this.itemData.length && 0 == e) {
//             return;
//         }
//         let s = this.itemData.length > 0 ? this.itemData.length : e;
//         for (let e = t; e < s; e++) {
//             let t = { startPos: 0, endPos: 0 };
//             0 === e ? (t.startPos = 0, this.itemHeightMap.get(e) ? t.endPos = -this.itemHeightMap.get(e) : i ? (t.endPos = -i, this.itemHeightMap.set(e, i)) : (t.endPos = -this._itemHeight, this.itemHeightMap.set(e, this._itemHeight))) : (t.startPos = this.itemPosMap.get(e - 1).endPos - this.itemInterval, this.itemHeightMap.get(e) ? t.endPos = t.startPos - this.itemHeightMap.get(e) : i ? (t.endPos = t.startPos - i, this.itemHeightMap.set(e, i)) : (t.endPos = t.startPos - this._itemHeight, this.itemHeightMap.set(e, this._itemHeight)));
//             this.itemPosMap.set(e, t);
//         }
//         this.itemData.length > 0 && this.updateContentHeigh(Math.abs(this.itemPosMap.get(this.itemData.length - 1).endPos));
//     }
//     *GeneratorInitAllItem() {
//         let t = 0;
//         for (let e = 0, i = this.itemData.length; e < i; e++) {
//             if (this.content.getComponent(UITransform).height > this.layerHeight) {
//                 if (t++ >= 2) {
//                     break;
//                 }
//                 let i;
//                 i = 0 === e ? 0 : this.itemPosMap.get(e) ? -(this.itemPosMap.get(e).endPos + this.itemInterval) : 3000;
//                 yield this.addItemNode(e, i);
//                 this.updateContentHeigh(Math.abs(i) + this._itemHeight);
//             }
//         }
//     }
//     initAllItem() {
//         let t = 0;
//         for (let e = 0, i = this.itemData.length; e < i; e++) {
//             if (this.content.getComponent(UITransform).height > this.layerHeight) {
//                 if (t++ >= 2) {
//                     break;
//                 }
//                 let i;
//                 i = 0 === e ? 0 : this.itemPosMap.get(e) ? -(this.itemPosMap.get(e).endPos + this.itemInterval) : 3000;
//                 this.addItemNode(e, i);
//                 this.updateContentHeigh(Math.abs(i) + this._itemHeight);
//             }
//         }
//     }
//     executePreFrame(t, e) {
//         return new Promise(((i, s) => {
//             let h = t, n = () => {
//                 let t = (new Date).getTime();
//                 for (let s = h.next();; s = h.next()) {
//                     if (null == s || s.done) {
//                         return void i();
//                     }
//                     if ((new Date).getTime() - t > e) {
//                         return void this.scheduleOnce((() => {
//                             n();
//                         }), game.frameTime / 1000);
//                     }
//                 }
//             };
//             n();
//         }));
//     }
//     *GeneratorReInitAllItem() {
//         this.itemPosMap.clear();
//         let t = Math.ceil(this.layerHeight / this._itemHeight);
//         this.getItemPos(0, t);
//         let e = this.itemData.length;
//         this.getAllItemHeight() + (e - 1) * this.itemInterval >= this.layerHeight && (e = t + 2);
//         let i = new Vec3;
//         for (let t = 0; t < e; t++) {
//             let e = this.itemArr[t];
//             if (null != e && null != e) {
//                 t < this.itemData.length ? (e.name = "index_" + String(t), e.active = true, this.setCellData(e, this.itemData[t], t), e.getPosition(i), e.setPosition(v3(i.x, this.itemPosMap.get(t).startPos))) : (e.name = "index_-1", e.active = false, e.getPosition(i), e.setPosition(v3(i.x, 3000)));
//             }
//             else {
//                 let e;
//                 e = 0 === t ? 0 : this.itemPosMap.get(t) ? -(this.itemPosMap.get(t).endPos + this.itemInterval) : 3000;
//                 yield this.addItemNode(t, e);
//             }
//         }
//         if (e < this.itemArr.length) {
//             for (let t = e, s = this.itemArr.length; t < s; t++) {
//                 this.itemArr[t].active = false;
//                 this.itemArr[t].name = "index_-1";
//                 this.itemArr[t].getPosition(i);
//                 this.itemArr[t].setPosition(v3(i.x, 3000));
//             }
//         }
//     }
//     getAllItemHeight(t = -1) {
//         let e = 0;
//         if (t > 0) {
//             for (let i = 0; i <= t; i++) {
//                 e += this.itemHeightMap.get(i);
//             }
//         }
//         else {
//             for (let [t, i] of this.itemHeightMap.entries()) {
//                 e += i;
//             }
//         }
//         return e;
//     }
//     reInitAllItem() {
//         this.itemPosMap.clear();
//         let t = Math.ceil(this.layerHeight / this._itemHeight);
//         this.getItemPos(0, t);
//         let e = this.itemData.length;
//         this.getAllItemHeight() + (e - 1) * this.itemInterval >= this.layerHeight && (e = t + 4);
//         let i = new Vec3;
//         for (let t = 0; t < e; t++) {
//             let e = this.itemArr[t];
//             if (null != e && null != e) {
//                 t < this.itemData.length ? (e.name = "index_" + String(t), this.setCellData(e, this.itemData[t], t), e.getPosition(i), e.setPosition(v3(i.x, this.itemPosMap.get(t).startPos)), e.active = true) : (e.name = "index_-1", e.active = false, e.getPosition(i), e.setPosition(v3(i.x, 3000)));
//             }
//             else {
//                 let e;
//                 e = 0 === t ? 0 : this.itemPosMap.get(t) ? -(this.itemPosMap.get(t).endPos + this.itemInterval) : 3000;
//                 this.addItemNode(t, e);
//             }
//         }
//         if (e < this.itemArr.length) {
//             for (let t = e, s = this.itemArr.length; t < s; t++) {
//                 this.itemArr[t].active = false;
//                 this.itemArr[t].name = "index_-1";
//                 this.itemArr[t].getPosition(i);
//                 this.itemArr[t].setPosition(v3(i.x, 3000));
//             }
//         }
//     }
//     addItemNode(t, e) {
//         let i = instantiate(this.itemNode[0]);
//         i.name = "index_" + String(t);
//         i.setPosition(v3(i.getPosition().x, e));
//         i.parent = this.content;
//         null != this.itemData[t] || null != this.itemData[t] ? (i.active = true, this.setCellData(i, this.itemData[t], t)) : i.active = false;
//         this.itemArr.push(i);
//     }
//     updateContentHeigh(t) {
//         this.content.getComponent(UITransform).height = t > this.layerHeight ? t : this.layerHeight;
//     }
//     updateFirstItemIndex(t) {
//         let e = this.firstItemIndex;
//         if (this.itemCanMoveUp && e > this.getCurIndexItems()[0] && e > 0) {
//             for (let t = e; t >= this.firstItemIndex - 1; t--) {
//                 this.itemMoveUp(t);
//             }
//         }
//         this.updateItemIndex();
//     }
//     updateLastItemIndex(t) {
//         let e = this.lastItemIndex;
//         if (this.itemCanMoveDown && e < this.getCurIndexItems()[1] && e + 1 < this.itemData.length) {
//             for (let t = e; t <= this.lastItemIndex + 1; t++) {
//                 this.itemMoveDown(t);
//             }
//         }
//         this.updateItemIndex();
//     }
//     testTime(t) {
//         let e = (new Date).getTime();
//         return this.lastTestTime = this.lastTestTime || e, (new Date).getTime() - this.lastTestTime;
//     }
//     updateItemIndex() {
//     }
//     itemMoveUp(t) {
//         t < 0 || this.lastItemIndex + 1 < t || t + 1 > this.itemData.length || this.hasItem(t) || this.moveItem(t, this.itemPosMap.get(t).startPos);
//     }
//     itemMoveDown(t) {
//         t < 0 || this.firstItemIndex - 1 > t || t + 1 > this.itemData.length || this.hasItem(t) || this.moveItem(t, this.itemPosMap.get(t).startPos);
//     }
//     hasItem(t) {
//         for (let e = 0, i = this.itemArr.length; e < i; e++) {
//             if (this.itemArr[e].name === "index_" + String(t)) {
//                 return true;
//             }
//         }
//         return false;
//     }
//     moveItem(t, e) {
//         let i, s, h, n = new Vec3;
//         for (let o = 0, r = this.itemArr.length; o < r; o++) {
//             if (i = this.getIndexOfItem(this.itemArr[o]), s = i < this.firstItemIndex - 1, h = i > this.lastItemIndex + 1, s || h) {
//                 return this.itemArr[o].name = "index_" + String(t), this.itemArr[o].getPosition(n), this.itemArr[o].setPosition(v3(n.x, e)), this.itemArr[o].active = true, this.setCellData(this.itemArr[o], this.itemData[t], t), void this.reSortItems();
//             }
//         }
//         let o = this.getItemByIndex(-1);
//         if (o) {
//             return o.name = "index_" + String(t), o.getPosition(n), o.setPosition(v3(n.x, e)), o.active = true, this.setCellData(o, this.itemData[t], t), void this.reSortItems();
//         }
//         this.addItemNode(t, e);
//     }
//     scrollEventCallback(t, e) {
//         if (this.content.getComponent(UITransform).height > this.layerHeight) {
//             let t = this.scrollView.getComponent(ScrollView).getScrollOffset().y;
//             if (this.b_refresh = false, this.itemData.length > 0 && this.freshTableFunc && t + this.layerHeight > this.content.getComponent(UITransform).height + this.freshDistance && (this.b_refresh = true), t < 0) {
//                 return;
//             }
//             t = -t;
//             let e = t - this.layerHeight;
//             this.initItemData && (this.initItemData = false, this.updateFirstItemIndex(t), this.itemCanMoveDown = true, this.updateLastItemIndex(e), this.itemCanMoveDown = false);
//             t > this.firstItemData.endPos && this.lastItemIndex + 1 < this.itemData.length && this.updateFirstItemIndex(t);
//             e < this.lastItemData.endPos && this.lastItemIndex + 1 < this.itemData.length && (this.itemCanMoveDown = true, this.updateLastItemIndex(e), this.itemCanMoveDown = false);
//             e < this.lastItemData.startPos && this.updateLastItemIndex(e);
//             t > this.firstItemData.startPos && (this.itemCanMoveUp = true, this.updateFirstItemIndex(t), this.itemCanMoveUp = false);
//         }
//         else {
//             this.itemData.length > 0 && this.freshTableFunc && (this.b_refresh = true);
//         }
//     }
//     onTouchBegan(t) {
//         this.b_refresh = false;
//     }
//     onTouchEnd(t) {
//         this.b_refresh && this.freshTableFunc && this.freshTableFunc();
//     }
//     onTouchMove(t) {
//         this._scrollcallback && this._scrollcallback();
//     }
//     stopAutoScroll() {
//         this.scrollView.getComponent(ScrollView).stopAutoScroll();
//     }
// }

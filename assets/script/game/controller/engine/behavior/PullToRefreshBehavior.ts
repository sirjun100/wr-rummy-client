// // @ts-nocheck
// // Recovered from index.js:353
// import { _decorator, Component, Node, ScrollView } from "cc";
// const { ccclass, property } = _decorator;
// @ccclass("PullToRefreshBehavior")
// export class PullToRefreshBehavior extends Component {
//     @property(ScrollView)
//     public scrollView: ScrollView = null;
//     public startPos: any = null;
//     public threshold: number = 100;
//     public isRefreshing: boolean = false;
//     public isLoadingMore: boolean = false;
//     public onRefresh: any = null;
//     public onLoadMore: any = null;
//     onLoad() {
//         this.scrollView.node.on("scrolling", this.onScrolling, this);
//         this.scrollView.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
//         this.scrollView.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
//         this.scrollView.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
//     }
//     setOnRefresh(s) {
//         this.onRefresh = s;
//     }
//     setOnLoadMore(s) {
//         this.onLoadMore = s;
//     }
//     onTouchStart(s) {
//         this.startPos = s.getUILocation();
//     }
//     onTouchEnd(s) {
//         if (this.isRefreshing || !this.startPos) {
//             return;
//         }
//         const e = s.getUILocation().y - this.startPos.y;
//         this.scrollView.getScrollOffset().y <= 0 && e > this.threshold && this.triggerRefresh();
//         this.startPos = null;
//     }
//     onScrolling() {
//         if (this.isLoadingMore || !this.scrollView) {
//             return;
//         }
//         const s = this.scrollView.getScrollOffset(), e = this.scrollView.getMaxScrollOffset();
//         s.y >= e.y - this.threshold && this.triggerLoadMore();
//     }
//     triggerRefresh() {
//         this.isRefreshing || (this.isRefreshing = true, this.onRefresh && this.onRefresh());
//     }
//     triggerLoadMore() {
//         this.isLoadingMore || (this.isLoadingMore = true, this.onLoadMore && this.onLoadMore());
//     }
//     finishRefresh() {
//         this.isRefreshing = false;
//     }
//     finishLoadMore() {
//         this.isLoadingMore = false;
//     }
// }

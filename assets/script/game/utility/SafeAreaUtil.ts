import { Node, SafeArea, screen, size, sys, UITransform, v3, view, Widget } from "cc";
import { DESIGN_SCREEN_HEIGHT, DESIGN_SCREEN_WIDTH } from "../config/ScreenConfig";
import { NodeUtil } from "./NodeUtil";

export class SafeAreaUtil {
    private static orientationLandscape = false;

    public static SetOrientationLandscape(landscape: boolean): void {
        SafeAreaUtil.orientationLandscape = landscape;
    }

    public static GetSafeDistance(): number {
        let inset = sys.getSafeAreaRect().y;
        if (SafeAreaUtil.orientationLandscape && sys.getSafeAreaRect().x > inset) {
            inset = sys.getSafeAreaRect().x;
        }
        return inset;
    }

    public static AdaptSafeArea(node: Node, mode: number = 0): number {
        let offset = 0;
        if (sys.os === sys.OS.IOS && NodeUtil.IsValid(node)) {
            if (mode === 0 && node.getComponent(SafeArea)) {
                node.getComponent(SafeArea).enabled = false;
                if (SafeAreaUtil.GetSafeDistance() > 40) {
                    offset = 40;
                    node.getComponent(Widget).top = SafeAreaUtil.GetSafeDistance() - offset;
                }
            } else if (mode === 1 && SafeAreaUtil.GetSafeDistance() > 40) {
                offset = 40;
                const y = 40 - SafeAreaUtil.GetSafeDistance();
                node.setPosition(v3(0, y, 0));
            }
        }
        return offset;
    }

    public static GetFitTopHeightDiff(): number {
        let diff = 0;
        const windowSize = screen.windowSize;
        const visible = view.getVisibleSize();
        if (windowSize.width / windowSize.height < visible.width / visible.height) {
            diff = (visible.height - 40) * (visible.width / visible.height - windowSize.width / windowSize.height);
        }
        return diff;
    }

    public static GetFitBottomHeightDiff(): number {
        let diff = 0;
        const windowSize = screen.windowSize;
        const visible = view.getVisibleSize();
        if (windowSize.width / windowSize.height < visible.width / visible.height) {
            diff = (visible.height / 2) * (visible.width / visible.height - windowSize.width / windowSize.height);
        }
        return diff;
    }

    public static GetHorizontalSize(): { width: number; height: number } {
        const visible = view.getVisibleSize();
        let width = visible.width >= visible.height ? visible.width : visible.height;
        let height = DESIGN_SCREEN_HEIGHT;
        let designWidth = DESIGN_SCREEN_WIDTH;
        if (width > height) {
            height = width;
        }
        return size(width, designWidth);
    }

    public static GetRealViewSize(): { width: number; height: number } {
        view.getVisibleSize();
        return size(DESIGN_SCREEN_WIDTH, DESIGN_SCREEN_HEIGHT);
    }

    public static ShowFullScreen(node: Node): void {
        if (!NodeUtil.IsValid(node)) {
            return;
        }
        const transform = node.getComponent(UITransform);
        let edge =
            DESIGN_SCREEN_HEIGHT > DESIGN_SCREEN_WIDTH ? DESIGN_SCREEN_HEIGHT : DESIGN_SCREEN_WIDTH;
        const visible = view.getVisibleSize();
        const maxEdge = visible.width >= visible.height ? visible.width : visible.height;
        if (maxEdge > edge) {
            edge = maxEdge;
        }
        transform.setContentSize(size(edge, edge));
    }
}

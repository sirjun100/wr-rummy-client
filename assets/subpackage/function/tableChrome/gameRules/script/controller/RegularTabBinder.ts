import {
    color,
    HorizontalTextAlignment,
    isValid,
    Label,
    Layout,
    Node,
    Overflow,
    ScrollView,
    Sprite,
    SpriteFrame,
    UITransform,
    v3,
    VerticalTextAlignment,
} from "cc";
import type { RegularTabId } from "../config/RegularConfig";
import { DealsRulesText } from "../config/RegularConfig";
import { findDeep } from "../utility/RegularUiHelper";

const TAB_INACTIVE = color(0, 0, 0);
const TAB_ACTIVE = color(111, 0, 0);

export class RegularTabBinder {
    private lastTab: RegularTabId = "point";

    public constructor(
        private readonly root: Node,
        private readonly rummySelect: Node | null,
        private readonly ruleSp: Node | null,
        private readonly scrollView: ScrollView | null,
        private readonly fallbackRules: SpriteFrame[],
        private readonly btnImgs: SpriteFrame[],
    ) {}

    public showTab(
        tab: RegularTabId,
        mainSprite: SpriteFrame | null,
        pointContentSprite: SpriteFrame | null,
    ): void {
        if (!this.rummySelect || !this.ruleSp) {
            return;
        }
        let next = tab;
        if (!isValid(this.rummySelect.getChildByName(next), true)) {
            next = this.lastTab;
        }
        this.highlightTab(next);
        this.lastTab = next;
        this.scrollView?.stopAutoScroll();
        this.scrollView?.scrollToTop(0);
        const isDeal = next === "deal";
        this.showDealsRules(isDeal);
        if (!isDeal) {
            const sprite = mainSprite ?? this.fallbackForTab(next);
            const sp = this.ruleSp.getComponent(Sprite);
            if (sp && sprite) {
                sp.enabled = true;
                sp.spriteFrame = sprite;
            }
            this.ruleSp.active = true;
            if (next === "point" && pointContentSprite) {
                const content = findDeep(this.root, "rule_content");
                setSpriteOnNode(content, pointContentSprite);
            }
        }
    }

    public getLastTab(): RegularTabId {
        return this.lastTab;
    }

    private highlightTab(tab: RegularTabId): void {
        for (const id of ["point", "pool", "deal"] as RegularTabId[]) {
            const node = this.rummySelect!.getChildByName(id);
            if (!node) {
                continue;
            }
            const wz = node.getChildByName("wz")?.getComponent(Label);
            const di = node.getChildByName("di")?.getComponent(Sprite);
            if (wz) {
                wz.color = id === tab ? TAB_ACTIVE : TAB_INACTIVE;
            }
            if (di && this.btnImgs.length >= 2) {
                di.spriteFrame = id === tab ? this.btnImgs[0] : this.btnImgs[1];
            }
        }
    }

    private fallbackForTab(tab: RegularTabId): SpriteFrame | null {
        if (tab === "point") {
            return this.fallbackRules[0] ?? null;
        }
        if (tab === "pool") {
            return this.fallbackRules[1] ?? null;
        }
        return this.fallbackRules[2] ?? null;
    }

    private showDealsRules(show: boolean): void {
        const sp = this.ruleSp!.getComponent(Sprite);
        if (sp) {
            sp.enabled = !show;
        }
        let node = this.ruleSp!.getChildByName("deals_rules_text");
        if (!show) {
            if (node) {
                node.active = false;
            }
            return;
        }
        const scrollNode = this.scrollView?.node;
        if (!node && scrollNode) {
            node = new Node("deals_rules_text");
            node.parent = this.ruleSp!;
            node.layer = this.ruleSp!.layer;
            const transform = node.addComponent(UITransform);
            transform.setAnchorPoint(0.5, 1);
            transform.setContentSize(scrollNode.getComponent(UITransform)!.width - 40, 2300);
            const label = node.addComponent(Label);
            label.fontSize = 24;
            label.lineHeight = 36;
            label.color = color(49, 49, 49);
            label.horizontalAlign = HorizontalTextAlignment.LEFT;
            label.verticalAlign = VerticalTextAlignment.TOP;
            label.overflow = Overflow.RESIZE_HEIGHT;
            label.enableWrapText = true;
            label.string = DealsRulesText;
        }
        if (node) {
            node.active = true;
            node.getComponent(Label)?.updateRenderData(true);
            const bounds = this.ruleSp!.getComponent(UITransform);
            if (bounds && node.getComponent(UITransform)) {
                bounds.setContentSize(bounds.width, node.getComponent(UITransform)!.height + 40);
            }
            node.setPosition(v3(0, -20, 0));
            this.ruleSp!.parent?.getComponent(Layout)?.updateLayout();
        }
    }
}

function setSpriteOnNode(node: Node | null, frame: SpriteFrame): void {
    const sp = node?.getComponent(Sprite);
    if (sp) {
        sp.spriteFrame = frame;
    }
}

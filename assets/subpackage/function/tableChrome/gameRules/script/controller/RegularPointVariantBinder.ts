import { Node, Sprite, SpriteFrame } from "cc";
import { findDeep } from "../utility/RegularUiHelper";

export type PointVariantFlags = {
    showDouble6: boolean;
    isEasy: boolean;
    isMultiple: boolean;
    isBump: boolean;
};

export class RegularPointVariantBinder {
    public constructor(
        private readonly root: Node,
        private readonly ruleType: Node | null,
        private readonly ruleEasy: Node | null,
        private readonly ruleMultiple: Node | null,
        private readonly ruleBump: Node | null,
        private readonly ruleDouble: Node | null,
        private readonly ruleContent: Node | null,
    ) {}

    public applyForTab(tab: string, flags: PointVariantFlags): void {
        const isPoint = tab === "point";
        if (!isPoint) {
            this.setActive(this.ruleType, false);
            this.setActive(this.ruleDouble, false);
            this.setActive(this.ruleContent, false);
            this.setActive(this.ruleEasy, false);
            this.setActive(this.ruleMultiple, false);
            this.setActive(this.ruleBump, false);
            return;
        }
        const showDouble = flags.showDouble6;
        this.setActive(this.ruleType, showDouble);
        this.setActive(this.ruleDouble, showDouble);
        this.setActive(this.ruleContent, true);
        this.setActive(this.ruleEasy, flags.isEasy);
        this.setActive(this.ruleMultiple, flags.isMultiple);
        this.setActive(this.ruleBump, flags.isBump);
        this.refreshPointSprites(flags);
    }

    private refreshPointSprites(flags: PointVariantFlags): void {
        const easySp = findDeep(this.root, "sp_easy");
        const multiSp = findDeep(this.root, "sp_multiple");
        const bumpSp = findDeep(this.root, "sp_bump");
        const doubleSp = findDeep(this.root, "sp_double");
        if (!flags.isEasy && !flags.isMultiple && !flags.isBump) {
            this.showOnlyVariant(easySp, true);
            this.showOnlyVariant(multiSp, false);
            this.showOnlyVariant(bumpSp, false);
            return;
        }
        this.showOnlyVariant(easySp, flags.isEasy);
        this.showOnlyVariant(multiSp, flags.isMultiple);
        this.showOnlyVariant(bumpSp, flags.isBump);
        if (flags.showDouble6) {
            this.showOnlyVariant(doubleSp, true);
        }
    }

    private showOnlyVariant(node: Node | null, on: boolean): void {
        if (node) {
            node.active = on;
        }
    }

    public async loadVariantSprite(
        nodeName: string,
        bundlePath: string,
        loader: (path: string) => Promise<SpriteFrame | null>,
    ): Promise<void> {
        const node = findDeep(this.root, nodeName);
        const frame = await loader(bundlePath);
        const sp = node?.getComponent(Sprite);
        if (sp && frame) {
            sp.spriteFrame = frame;
        }
    }

    private setActive(node: Node | null, active: boolean): void {
        if (node) {
            node.active = active;
        }
    }
}

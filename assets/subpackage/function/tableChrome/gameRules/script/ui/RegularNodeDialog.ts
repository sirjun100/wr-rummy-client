import { _decorator, Button, Node, ScrollView, SpriteFrame, Widget } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { HallConfigModel } from "../../../../hall/hallMenu/script/model/HallConfigModel";
import type { RegularTabId } from "../config/RegularConfig";
import { RegularTexturePath } from "../config/RegularConfig";
import type { HallRegularOpenData } from "../config/RegularProtocol";
import { RegularPointVariantBinder } from "../controller/RegularPointVariantBinder";
import { RegularTabBinder } from "../controller/RegularTabBinder";
import { RegularUiModel } from "../model/RegularUiModel";
import { applyHallLandscapeLayout, findDeep, loadSpriteFromBundle } from "../utility/RegularUiHelper";
import { ensureRegularRegistered } from "../RegularModule";

const { ccclass, property } = _decorator;

@ccclass("RegularNodeDialog")
export class RegularNodeDialog extends BaseDialog {
    @property(Node)
    public bg: Node = null;

    @property(Node)
    public rummy_select: Node = null;

    @property(Node)
    public rule_sp: Node = null;

    @property(Node)
    public rule_type: Node = null;

    @property(Node)
    public rule_easy: Node = null;

    @property(Node)
    public rule_multiple: Node = null;

    @property(Node)
    public rule_bump: Node = null;

    @property(Node)
    public rule_double: Node = null;

    @property(Node)
    public rule_content: Node = null;

    @property([SpriteFrame])
    public game_rules: SpriteFrame[] = [];

    @property([SpriteFrame])
    public btn_imgs: SpriteFrame[] = [];

    private tabBinder: RegularTabBinder | null = null;

    private variantBinder: RegularPointVariantBinder | null = null;

    private openData: HallRegularOpenData = {};

    protected OnInit(uiData: HallRegularOpenData = null): void {
        ensureRegularRegistered();
        this.openData = uiData ?? GameApp.Interface.GetModel(RegularUiModel).hallOpen.value ?? {};
        const hall = GameApp.Interface.GetModel(HallConfigModel);
        const flags = {
            isEasy: this.openData.isEasy ?? hall.isPointsEasyMode(),
            isMultiple: this.openData.isMultiple ?? hall.isMultipleRummyOpen(),
            isBump: this.openData.isBump ?? hall.isBumpRummyOpen(),
            showDouble6: hall.isDouble6Open(),
        };
        const scroll = findDeep(this.bg, "scrollview")?.getComponent(ScrollView) ?? null;
        this.tabBinder = new RegularTabBinder(
            this.node,
            this.rummy_select,
            this.rule_sp,
            scroll,
            this.game_rules,
            this.btn_imgs,
        );
        this.variantBinder = new RegularPointVariantBinder(
            this.node,
            this.rule_type,
            this.rule_easy,
            this.rule_multiple,
            this.rule_bump,
            this.rule_double,
            this.rule_content,
        );
        this.wireTabButtons();
        this.wireCloseButtons();
        const bgColor = findDeep(this.node, "bg_color");
        bgColor?.getComponent(Widget)?.updateAlignment();
        if (this.openData.isLandscape) {
            applyHallLandscapeLayout(this.node);
        }
        const tab =
            this.openData.ruleFlag ??
            GameApp.Interface.GetModel(RegularUiModel).lastTab.value ??
            ("point" as RegularTabId);
        void this.refreshTab(tab, flags);
    }

    protected OnClose(): void {
        const last = this.tabBinder?.getLastTab();
        if (last) {
            GameApp.Interface.GetModel(RegularUiModel).lastTab.value = last;
        }
    }

    /** Prefab click events (legacy handler name). */
    public onClickByBtn(_e: unknown, data: string): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        if (data === "close" || data === "back") {
            this.CloseSelf();
        }
    }

    public onClickByTab(_e: unknown, tab: string): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        const hall = GameApp.Interface.GetModel(HallConfigModel);
        void this.refreshTab(tab as RegularTabId, {
            isEasy: this.openData.isEasy ?? hall.isPointsEasyMode(),
            isMultiple: this.openData.isMultiple ?? hall.isMultipleRummyOpen(),
            isBump: this.openData.isBump ?? hall.isBumpRummyOpen(),
            showDouble6: hall.isDouble6Open(),
        });
    }

    private wireTabButtons(): void {
        for (const tab of ["point", "pool", "deal"]) {
            const n = this.rummy_select?.getChildByName(tab);
            const btn = n?.getComponent(Button);
            if (btn) {
                btn.node.off(Button.EventType.CLICK);
                btn.node.on(Button.EventType.CLICK, () => this.onClickByTab(null, tab), this);
            }
        }
    }

    private wireCloseButtons(): void {
        const names = ["close", "back", "back_big"];
        for (const name of names) {
            const n = findDeep(this.node, name);
            const btn = n?.getComponent(Button);
            if (btn) {
                btn.node.off(Button.EventType.CLICK);
                btn.node.on(Button.EventType.CLICK, () => this.onClickByBtn(null, "close"), this);
            }
        }
    }

    private async refreshTab(
        tab: RegularTabId,
        flags: { isEasy: boolean; isMultiple: boolean; isBump: boolean; showDouble6: boolean },
    ): Promise<void> {
        let mainPath = RegularTexturePath.points;
        if (tab === "pool") {
            mainPath = RegularTexturePath.pool;
        }
        const mainSprite = tab === "deal" ? null : await loadSpriteFromBundle(mainPath);
        const contentSprite =
            tab === "point" ? await loadSpriteFromBundle(RegularTexturePath.pointsContent) : null;
        this.tabBinder?.showTab(tab, mainSprite, contentSprite);
        this.variantBinder?.applyForTab(tab, flags);
        if (tab === "point" && flags.showDouble6) {
            void this.variantBinder?.loadVariantSprite("sp_double", RegularTexturePath.pointsDouble, loadSpriteFromBundle);
        }
    }
}

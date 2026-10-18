import { _decorator, Button, Label, Node, ScrollView, Sprite, Widget } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { SubGameId } from "../../../../../script/game/config/BundleManifest";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import type { GameRegularOpenData } from "../config/RegularProtocol";
import { applyHallLandscapeLayout, findDeep } from "../utility/RegularUiHelper";
import { ensureRegularRegistered } from "../RegularModule";

const { ccclass, property } = _decorator;

@ccclass("GameRegularDialog")
export class GameRegularDialog extends BaseDialog {
    @property(Node)
    public bg: Node = null;

    @property(Node)
    public pageView: Node = null;

    @property(Node)
    public rule_sp: Node = null;

    @property(Node)
    public rule_wz: Node = null;

    private gameType = SubGameId.Rummy;

    protected OnInit(uiData: GameRegularOpenData = null): void {
        ensureRegularRegistered();
        const data = uiData ?? {};
        this.gameType = data.gameType ?? SubGameId.Rummy;
        const scroll = (this.pageView ?? findDeep(this.bg, "scrollview"))?.getComponent(ScrollView);
        scroll?.stopAutoScroll();
        scroll?.scrollToTop(0);
        const useText = data.useText === true || (!data.spriteFrame && !!data.text);
        if (useText && this.rule_wz) {
            this.rule_sp.active = false;
            this.rule_wz.active = true;
            const lab = this.rule_wz.getComponent(Label);
            if (lab) {
                lab.string = data.text ?? "";
            }
        } else if (this.rule_sp) {
            this.rule_sp.active = true;
            if (this.rule_wz) {
                this.rule_wz.active = false;
            }
            const sp = this.rule_sp.getComponent(Sprite);
            if (sp && data.spriteFrame) {
                sp.spriteFrame = data.spriteFrame;
            }
        }
        findDeep(this.node, "bg_color")?.getComponent(Widget)?.updateAlignment();
        if (data.landscape) {
            applyHallLandscapeLayout(this.node, this.gameType);
        }
        this.wireCloseButtons();
    }

    protected OnClose(): void {}

    public onClickByBtn(_e: unknown, data: string): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        if (data === "close") {
            this.CloseSelf();
        }
    }

    private wireCloseButtons(): void {
        for (const name of ["close", "back", "back_big"]) {
            const n = findDeep(this.node, name);
            n?.off(Button.EventType.CLICK);
            n?.on(Button.EventType.CLICK, () => this.onClickByBtn(null, "close"), this);
        }
    }
}

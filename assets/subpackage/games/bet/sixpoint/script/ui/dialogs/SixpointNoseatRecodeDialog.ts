import { _decorator, find, instantiate, Label, Node, Sprite, SpriteFrame } from "cc";
import { BaseDialog } from "../../../../../../../script/game/controller/engine/BaseDialog";
import { GameApp } from "../../../../../../../script/game/GameApp";
import { SixpointModel } from "../../model/SixpointModel";

const { ccclass, property } = _decorator;

@ccclass("SixpointNoseatRecodeDialog")
export class SixpointNoseatRecodeDialog extends BaseDialog {
    @property(Node)
    public scrollView: Node | null = null;

    @property(Node)
    public moban: Node | null = null;

    @property([SpriteFrame])
    public dotImgs: SpriteFrame[] = [];

    protected OnInit(): void {
        const root = find("rootNode", this.node) ?? this.node;
        this.scrollView = this.scrollView ?? find("trend_list", root) ?? root.getChildByName("trend_list");
        this.moban = this.moban ?? find("moban", root) ?? root.getChildByName("moban");
        const model = GameApp.Interface.GetModel(SixpointModel);
        this.refreshUI(model.historyRecord);
        model.table.RegisterWithInitValue(() => {
            this.refreshUI(model.historyRecord);
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
    }

    public refreshUI(history: number[][]): void {
        const list = this.scrollView;
        const template = this.moban;
        if (!list || !template) {
            return;
        }
        list.removeAllChildren();
        for (let row = 0; row < history.length; row++) {
            const colData = history[row] ?? [];
            const rowNode = instantiate(template);
            rowNode.active = true;
            list.addChild(rowNode);
            let start = 0;
            const len = colData.length;
            if (len > 14) {
                start = len - 14;
            }
            let dotIdx = 0;
            for (let s = start; s < len; s++) {
                const point = colData[s];
                const dot = rowNode.getChildByName(`dot${dotIdx}`);
                if (!dot) {
                    break;
                }
                const num = dot.getChildByName("num")?.getComponent(Label);
                const spr = dot.getComponent(Sprite);
                if (point >= 0 && point <= 1) {
                    if (num) {
                        num.string = "X";
                    }
                    if (spr && this.dotImgs[0]) {
                        spr.spriteFrame = this.dotImgs[0];
                    }
                } else {
                    if (num) {
                        num.string = String(point);
                    }
                    if (spr && this.dotImgs[1]) {
                        spr.spriteFrame = this.dotImgs[1];
                    }
                }
                dotIdx += 1;
            }
        }
    }

    public touchBtnEvent(_e: unknown, data: string): void {
        if (data === "close") {
            this.CloseSelf();
        }
    }
}

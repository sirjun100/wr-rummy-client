import { _decorator, find, instantiate, Label, Node, ScrollView } from "cc";
import { BaseDialog } from "../../../../../../../script/game/controller/engine/BaseDialog";
import { Utility } from "../../../../../../../script/game/utility/Utility";

const { ccclass, property } = _decorator;

export type SixpointPlayerRow = { name?: string; money?: number; avatar?: string; avatar_url?: string };

@ccclass("SixpointNoseatPlayersDialog")
export class SixpointNoseatPlayersDialog extends BaseDialog {
    @property(Node)
    public scrollView: Node | null = null;

    @property(Node)
    public moban: Node | null = null;

    public curPage = 1;
    public totalPage = 1;

    protected OnInit(): void {
        const root = find("rootNode", this.node) ?? this.node;
        this.scrollView =
            this.scrollView ?? find("scrollView", root) ?? root.getChildByName("scrollView");
        this.moban = this.moban ?? find("moban", root) ?? root.getChildByName("moban");
    }

    public refreshUI(data: { page?: number; total?: number; players?: SixpointPlayerRow[] }): void {
        if (data.page != null) {
            this.curPage = data.page;
        }
        if (data.total != null) {
            this.totalPage = data.total;
        }
        const scroll = this.scrollView?.getComponent(ScrollView);
        const content = scroll?.content ?? this.scrollView;
        const template = this.moban;
        if (!content || !template || !data.players?.length) {
            return;
        }
        for (const p of data.players) {
            const row = instantiate(template);
            row.active = true;
            const nameLbl = row.getChildByName("name")?.getComponent(Label);
            if (nameLbl && p.name) {
                nameLbl.string = p.name.length > 10 ? `${p.name.slice(0, 10)}…` : p.name;
            }
            const chip = row.getChildByName("chip_num")?.getComponent(Label);
            if (chip && p.money != null) {
                chip.string = Utility.format.chipCompact(p.money);
            }
            content.addChild(row);
        }
    }

    public touchBtnEvent(_e: unknown, data: string): void {
        if (data === "close") {
            this.CloseSelf();
        }
    }
}

import { _decorator, Button, Component, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import type { PropsItemDto } from "../config/PropsProtocol";
import { PropsManageModel } from "../model/PropsManageModel";

const { ccclass, property } = _decorator;

type StyleTab = "table" | "face" | "back";

@ccclass("PropsStyleTabBinder")
export class PropsStyleTabBinder extends Component {
    @property(Label)
    public titleLabel: Label | null = null;

    @property(Label)
    public itemLabel: Label | null = null;

    @property(Node)
    public prevBtn: Node | null = null;

    @property(Node)
    public nextBtn: Node | null = null;

    private tab: StyleTab = "table";
    private items: PropsItemDto[] = [];
    private selectIndex = 0;
    private onDirty: (() => void) | null = null;

    public bind(onDirty: () => void): void {
        this.onDirty = onDirty;
        const model = GameApp.Interface.GetModel(PropsManageModel);
        model.page.RegisterWithInitValue((page) => {
            if (!page) {
                return;
            }
            this.loadTab(this.tab);
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
        this.wireButtons();
    }

    private wireButtons(): void {
        this.prevBtn?.on(Button.EventType.CLICK, () => this.step(-1), this);
        this.nextBtn?.on(Button.EventType.CLICK, () => this.step(1), this);
    }

    public setTab(tab: StyleTab): void {
        this.tab = tab;
        this.loadTab(tab);
    }

    public onTabTable(): void {
        this.setTab("table");
    }

    public onTabFace(): void {
        this.setTab("face");
    }

    public onTabBack(): void {
        this.setTab("back");
    }

    private loadTab(tab: StyleTab): void {
        const model = GameApp.Interface.GetModel(PropsManageModel);
        const page = model.page.value;
        if (!page) {
            return;
        }
        if (tab === "table") {
            this.items = page.table_items ?? [];
            this.selectIndex = this.indexOfId(this.items, model.draftStyles.tableId);
        } else if (tab === "face") {
            this.items = page.face_items ?? [];
            this.selectIndex = this.indexOfId(this.items, model.draftStyles.faceId);
        } else {
            this.items = page.back_items ?? [];
            this.selectIndex = this.indexOfId(this.items, model.draftStyles.backId);
        }
        if (this.titleLabel) {
            this.titleLabel.string = tab === "table" ? "Table cloth" : tab === "face" ? "Card face" : "Card back";
        }
        this.refreshItemLabel();
    }

    private indexOfId(items: PropsItemDto[], id: number): number {
        const idx = items.findIndex((i) => i.id === id);
        return idx >= 0 ? idx : 0;
    }

    private step(delta: number): void {
        if (this.items.length === 0) {
            return;
        }
        this.selectIndex = (this.selectIndex + delta + this.items.length) % this.items.length;
        const item = this.items[this.selectIndex];
        const model = GameApp.Interface.GetModel(PropsManageModel);
        if (this.tab === "table" && item?.id) {
            model.draftStyles.tableId = item.id;
        } else if (this.tab === "face" && item?.id) {
            model.draftStyles.faceId = item.id;
        } else if (item?.id) {
            model.draftStyles.backId = item.id;
        }
        this.refreshItemLabel();
        this.onDirty?.();
    }

    private refreshItemLabel(): void {
        const item = this.items[this.selectIndex];
        if (this.itemLabel) {
            this.itemLabel.string = item?.name ?? `ID ${item?.id ?? 0}`;
        }
    }

    public getApplyBody(): { table_id?: number; table_face_id?: number; table_back_id?: number; changed: boolean } {
        const model = GameApp.Interface.GetModel(PropsManageModel);
        const eq = model.page.value?.equipped;
        const draft = model.draftStyles;
        const changed =
            (eq?.table_id ?? draft.tableId) !== draft.tableId ||
            (eq?.table_face_id ?? draft.faceId) !== draft.faceId ||
            (eq?.table_back_id ?? draft.backId) !== draft.backId;
        return {
            table_id: draft.tableId,
            table_face_id: draft.faceId,
            table_back_id: draft.backId,
            changed,
        };
    }
}

import { _decorator, Button, instantiate, Label, Layout, Node, Vec3, tween } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { I18NSystem } from "../../../../../script/game/system/I18NSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { Utility } from "../../../../../script/game/utility/Utility";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { ensureBeginnerFlipTaskRegistered } from "../BeginnerFlipTaskModule";
import { FetchBeginnerFlipRecordsCommand } from "../command/FetchBeginnerFlipRecordsCommand";
import {
    BeginnerFlipRecordItemDto,
    BeginnerFlipRecordOpenData,
} from "../config/BeginnerFlipTaskConfig";
import { BeginnerFlipRecordsFetchFailedEvent } from "../event/BeginnerFlipTaskEvents";
import { BeginnerFlipTaskModel } from "../model/BeginnerFlipTaskModel";

const { ccclass, property } = _decorator;

@ccclass("BeginnerFlipRecordDialog")
export class BeginnerFlipRecordDialog extends BaseDialog {
    @property(Node)
    public root: Node = null;

    @property(Node)
    public itemRoot: Node = null;

    @property(Node)
    public moban: Node = null;

    private lastClick = 0;

    private get ui(): UISystem {
        return GameApp.Interface.GetSystem(UISystem);
    }

    protected OnInit(_uiData: BeginnerFlipRecordOpenData = null): void {
        ensureBeginnerFlipTaskRegistered();
        this.ensureEditorRefs();
        if (this.moban) {
            this.moban.active = false;
        }
        this.wireButtons();
        this.registerEvents();
        GameApp.Interface.SendCommand(new FetchBeginnerFlipRecordsCommand());
    }

    private ensureEditorRefs(): void {
        if (!this.root) {
            this.root = this.node.getChildByName("root");
        }
        if (!this.itemRoot && this.root) {
            this.itemRoot = this.root.getChildByName("itemRoot") ?? this.root.getChildByName("ScrollView");
        }
        if (!this.moban && this.root) {
            this.moban = this.root.getChildByName("moban");
        }
    }

    private wireButtons(): void {
        const closeBtn = this.root?.getChildByName("close_btn");
        closeBtn?.on(Button.EventType.CLICK, () => this.onCloseClick(), this);
    }

    private registerEvents(): void {
        const model = GameApp.Interface.GetModel(BeginnerFlipTaskModel);
        model.records
            .RegisterWithInitValue((list) => {
                this.renderList(list ?? []);
            }, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(BeginnerFlipRecordsFetchFailedEvent, this.onFetchFailed, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private onFetchFailed(e: BeginnerFlipRecordsFetchFailedEvent): void {
        const i18n = GameApp.Interface.GetSystem(I18NSystem);
        this.ui.showToast(i18n.getValueByKey("utlis.text6"));
        LogKit.W("[BeginnerFlipRecordDialog] fetch failed {0}", e.message);
    }

    private renderList(list: BeginnerFlipRecordItemDto[]): void {
        if (!this.itemRoot || !this.moban) {
            return;
        }
        this.itemRoot.removeAllChildren();
        const nodata = this.root?.getChildByName("nodata");
        if (!list.length) {
            if (nodata) {
                nodata.active = true;
            }
            return;
        }
        if (nodata) {
            nodata.active = false;
        }
        for (const row of list) {
            const clone = instantiate(this.moban);
            clone.active = true;
            this.itemRoot.addChild(clone);
            this.fillRow(clone, row);
        }
        this.itemRoot.getComponent(Layout)?.updateLayout();
    }

    private fillRow(rowNode: Node, row: BeginnerFlipRecordItemDto): void {
        rowNode.getChildByName("date")?.getComponent(Label)?.string = row.reward_time ?? "";
        rowNode.getChildByName("game")?.getComponent(Label)?.string = String(row.play_num ?? "");
        const reward = rowNode.getChildByName("reward");
        const item0 = reward?.getChildByName("item0");
        const item1 = reward?.getChildByName("item1");
        if (row.cash && row.cash > 0 && item0) {
            item0.active = true;
            item0.getChildByName("num")?.getComponent(Label)?.string = String(row.cash);
            item0.getComponent(Layout)?.updateLayout();
        } else if (item0) {
            item0.active = false;
        }
        if (row.bonus && row.bonus > 0 && item1) {
            item1.active = true;
            item1.getChildByName("num")?.getComponent(Label)?.string = String(row.bonus);
            item1.getComponent(Layout)?.updateLayout();
        } else if (item1) {
            item1.active = false;
        }
        reward?.getComponent(Layout)?.updateLayout();
    }

    private onCloseClick(): void {
        if (Date.now() - this.lastClick < 500) {
            return;
        }
        this.lastClick = Date.now();
        this.CloseSelf();
    }

    protected startShowAnim(target: Node): void {
        if (!Utility.node.isValid(target)) {
            return;
        }
        target.setScale(new Vec3(0.85, 0.85, 1));
        tween(target).to(0.2, { scale: new Vec3(1, 1, 1) }).start();
    }
}

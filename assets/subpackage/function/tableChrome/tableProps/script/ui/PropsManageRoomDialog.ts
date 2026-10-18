import { _decorator, Button, find, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { ApplyPropsCommand } from "../command/ApplyPropsCommand";
import { PropsStyleTabBinder } from "../controller/PropsStyleTabBinder";
import { ensurePropsRegistered } from "../PropsManageModule";

const { ccclass, property } = _decorator;

@ccclass("PropsManageRoomDialog")
export class PropsManageRoomDialog extends BaseDialog {
    @property(PropsStyleTabBinder)
    public styleBinder: PropsStyleTabBinder | null = null;

    @property(Node)
    public saveBtn: Node | null = null;

    private clickLock = 0;

    protected OnInit(): void {
        ensurePropsRegistered();
        this.ensureBinder();
        this.styleBinder?.bind(() => this.refreshSave());
        this.saveBtn?.on(Button.EventType.CLICK, () => this.onSaveClick(), this);
        this.refreshSave();
    }

    private ensureBinder(): void {
        if (this.styleBinder) {
            return;
        }
        let binder = this.node.getComponent(PropsStyleTabBinder);
        if (!binder) {
            binder = this.node.addComponent(PropsStyleTabBinder);
            binder.titleLabel = this.findOrAddLabel("title");
            binder.itemLabel = this.findOrAddLabel("item");
        }
        this.styleBinder = binder;
        if (!this.saveBtn) {
            this.saveBtn = find("save_btn", this.node);
        }
    }

    private findOrAddLabel(name: string): Label {
        let n = find(name, this.node);
        if (!n) {
            n = new Node(name);
            n.parent = this.node;
        }
        let label = n.getComponent(Label);
        if (!label) {
            label = n.addComponent(Label);
        }
        return label;
    }

    private refreshSave(): void {
        const body = this.styleBinder?.getApplyBody();
        const btn = this.saveBtn?.getComponent(Button);
        if (btn) {
            btn.interactable = body?.changed ?? false;
        }
    }

    public onTabTable(): void {
        this.styleBinder?.onTabTable();
    }

    public onTabFace(): void {
        this.styleBinder?.onTabFace();
    }

    public onTabBack(): void {
        this.styleBinder?.onTabBack();
    }

    public onCloseClick(): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        this.CloseSelf();
    }

    public onSaveClick(): void {
        const now = Date.now();
        if (now - this.clickLock < 1000) {
            return;
        }
        this.clickLock = now;
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        const body = this.styleBinder?.getApplyBody();
        if (!body?.changed) {
            this.refreshSave();
            return;
        }
        GameApp.Interface.SendCommand(
            new ApplyPropsCommand({
                table_id: body.table_id,
                table_face_id: body.table_face_id,
                table_back_id: body.table_back_id,
            }),
        );
        this.scheduleOnce(() => this.CloseSelf(), 0.35);
    }
}

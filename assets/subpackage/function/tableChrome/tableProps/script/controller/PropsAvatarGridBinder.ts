import { _decorator, Button, Component, EditBox, instantiate, Node, Sprite, SpriteAtlas, SpriteFrame } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import type { PropsItemDto } from "../config/PropsProtocol";
import { PropsManageModel } from "../model/PropsManageModel";

const { ccclass, property } = _decorator;

@ccclass("PropsAvatarGridBinder")
export class PropsAvatarGridBinder extends Component {
    @property(Node)
    public avatarRoot: Node | null = null;

    @property(Node)
    public itemTemplate: Node | null = null;

    @property(SpriteAtlas)
    public avatarAtlas: SpriteAtlas | null = null;

    @property([SpriteFrame])
    public buttonImages: SpriteFrame[] = [];

    @property(Node)
    public saveBtn: Node | null = null;

    @property(EditBox)
    public nameEdit: EditBox | null = null;

    private selectIndex = -1;
    private avatarList: PropsItemDto[] = [];
    private onDirty: (() => void) | null = null;

    public bind(onDirty: () => void): void {
        this.onDirty = onDirty;
        const model = GameApp.Interface.GetModel(PropsManageModel);
        model.page.RegisterWithInitValue((page) => this.applyPage(page), this).UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private applyPage(page: { avatar_items?: PropsItemDto[]; equipped_profile?: { avatar_id?: number; name?: string } } | null): void {
        if (!page) {
            return;
        }
        this.avatarList = page.avatar_items ?? [];
        const prof = page.equipped_profile;
        if (this.nameEdit && prof?.name) {
            this.nameEdit.string = prof.name;
        }
        let select = 0;
        if (prof?.avatar_id) {
            const idx = this.avatarList.findIndex((a) => a.id === prof.avatar_id);
            if (idx >= 0) {
                select = idx;
            }
        }
        this.selectIndex = select;
        this.rebuildGrid();
        this.refreshSelection();
    }

    private rebuildGrid(): void {
        if (!this.avatarRoot || !this.itemTemplate) {
            return;
        }
        this.itemTemplate.active = false;
        this.avatarRoot.removeAllChildren();
        for (let i = 0; i < this.avatarList.length; i++) {
            const item = instantiate(this.itemTemplate);
            item.active = true;
            item.parent = this.avatarRoot;
            const btn = item.getComponent(Button);
            if (btn) {
                btn.clickEvents[0] && (btn.clickEvents[0].customEventData = String(i));
            }
            const head = item.getChildByName("head_mask")?.getChildByName("head_img");
            const sp = head?.getComponent(Sprite);
            const id = this.avatarList[i].id ?? 1;
            if (sp && this.avatarAtlas) {
                const frame = this.avatarAtlas.getSpriteFrame(`head_${id}`) ?? this.avatarAtlas.getSpriteFrame(`head_${id}.png`);
                if (frame) {
                    sp.spriteFrame = frame;
                }
            }
        }
    }

    public avatarChooseClick(_event: unknown, custom: string): void {
        const idx = Number(custom);
        if (idx === this.selectIndex) {
            return;
        }
        this.selectIndex = idx;
        this.refreshSelection();
        this.onDirty?.();
    }

    public onEditBoxChanged(): void {
        this.onDirty?.();
    }

    public onEditBoxEnded(): void {
        this.onDirty?.();
    }

    private refreshSelection(): void {
        if (!this.avatarRoot) {
            return;
        }
        const children = this.avatarRoot.children;
        for (let i = 0; i < children.length; i++) {
            const using = children[i].getChildByName("using");
            if (using) {
                using.active = i === this.selectIndex;
            }
        }
    }

    public getDraft(): { name: string; avatarId?: number; changed: boolean } {
        const model = GameApp.Interface.GetModel(PropsManageModel);
        const baseName = model.page.value?.equipped_profile?.name ?? "";
        const baseAvatar = model.page.value?.equipped_profile?.avatar_id ?? 1;
        const name = this.nameEdit?.string ?? baseName;
        const item = this.avatarList[this.selectIndex];
        const avatarId = item?.id ?? baseAvatar;
        const changed = name !== baseName || avatarId !== baseAvatar;
        return { name, avatarId, changed };
    }

    public setSaveEnabled(enabled: boolean): void {
        if (!this.saveBtn) {
            return;
        }
        const btn = this.saveBtn.getComponent(Button);
        if (btn) {
            btn.interactable = enabled;
        }
        const label = this.saveBtn.getChildByName("Label");
        const label2 = this.saveBtn.getChildByName("Label2");
        if (label && label2 && this.buttonImages.length >= 2) {
            label.active = !enabled;
            label2.active = enabled;
            const sp = this.saveBtn.getComponent(Sprite);
            if (sp) {
                sp.spriteFrame = enabled ? this.buttonImages[0] : this.buttonImages[1];
            }
        }
    }
}

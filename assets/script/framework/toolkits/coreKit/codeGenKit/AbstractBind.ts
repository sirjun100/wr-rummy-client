/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * AbstractBind — one Component per file (Cocos 2.x restriction)
 ****************************************************************************/


import * as cc from 'cc';
import { BindType, IBind } from "./BindTypes";
import { ViewController } from "./ViewController";

const { ccclass, property } = cc._decorator;

@ccclass
export abstract class AbstractBind extends cc.Component implements IBind {

    @property({ type: cc.Enum(BindType) })
    public MarkType: BindType = BindType.DefaultUnityElement;

    @property
    public CustomComponentName: string = "";

    @property
    public CustomComment: string = "";

    @property
    protected mComponentName: string = "";

    public get Comment(): string {
        return this.CustomComment;
    }

    public get Transform(): cc.Node {
        return this.node;
    }

    public GetBindType(): BindType {
        return this.MarkType;
    }

    public get TypeName(): string {
        if (this.MarkType === BindType.DefaultUnityElement) {
            if (!this.mComponentName) {
                this.mComponentName = this.GetDefaultComponentName();
            }
            return this.mComponentName;
        }
        if (this.MarkType === BindType.Element || this.MarkType === BindType.Component) {
            return this.CustomComponentName;
        }
        return this.mComponentName;
    }

    protected GetDefaultComponentName(): string {
        if (this.getComponent(ViewController)) {
            return "ViewController";
        }
        if (this.getComponent(cc.ScrollView)) {
            return "cc.ScrollView";
        }
        if (this.getComponent(cc.EditBox)) {
            return "cc.EditBox";
        }
        if (this.getComponent(cc.Button)) {
            return "cc.Button";
        }
        if (this.getComponent(cc.Label)) {
            return "cc.Label";
        }
        if (this.getComponent(cc.RichText)) {
            return "cc.RichText";
        }
        if (this.getComponent(cc.Toggle)) {
            return "cc.Toggle";
        }
        if (this.getComponent(cc.Slider)) {
            return "cc.Slider";
        }
        if (this.getComponent(cc.ProgressBar)) {
            return "cc.ProgressBar";
        }
        if (this.getComponent(cc.Sprite)) {
            return "cc.Sprite";
        }
        if (this.getComponent(cc.Canvas)) {
            return "cc.Canvas";
        }
        if (this.getComponent(cc.Camera)) {
            return "cc.Camera";
        }
        if (this.getComponent(cc.Widget)) {
            return "cc.Widget";
        }
        if (this.getComponent(cc.Layout)) {
            return "cc.Layout";
        }
        return "cc.Node";
    }
}

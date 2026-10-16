/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * ViewController — one Component per file (Cocos 2.x restriction)
 ****************************************************************************/


import * as cc from 'cc';
import { IBindGroup } from "./BindTypes";

const { ccclass, property } = cc._decorator;

@ccclass
export class ViewController extends cc.Component implements IBindGroup {

    @property
    public Namespace: string = "";

    @property
    public ScriptName: string = "";

    @property
    public ScriptsFolder: string = "";

    @property
    public GeneratePrefab: boolean = false;

    @property
    public PrefabFolder: string = "";

    @property
    public ArchitectureFullTypeName: string = "";

    @property
    public ViewControllerFullTypeName: string = "";

    public get TemplateName(): string {
        return "ViewController";
    }
}

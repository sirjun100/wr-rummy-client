/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * Shared Bind types (no Component — avoid circular imports)
 ****************************************************************************/


import * as cc from 'cc';
export enum BindType {
    /** Default node/component bind (Unity: DefaultUnityElement) */
    DefaultUnityElement = 0,
    Element = 1,
    Component = 2,
}

export interface IBind {
    readonly TypeName: string;
    readonly Comment: string;
    readonly Transform: cc.Node;
}

export interface IBindGroup {
    readonly TemplateName: string;
}

/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * CodeGenKit for Cocos Creator (TypeScript)
 * Runtime markers only — Unity Editor codegen is not ported.
 *
 * Note: Cocos 2.x allows only one @ccclass Component per script file —
 * Bind / ViewController / OtherBinds live in sibling files.
 ****************************************************************************/


import * as cc from 'cc';
import { AbstractBind } from "./AbstractBind";
import { IBind } from "./BindTypes";

export { BindType } from "./BindTypes";
export type { IBind, IBindGroup } from "./BindTypes";
export { AbstractBind } from "./AbstractBind";
export { Bind } from "./Bind";
export { ViewController } from "./ViewController";
export { BindInfo, OtherBinds } from "./OtherBinds";

/**
 * Collect Bind markers under a ViewController root (runtime helper for hand/codegen).
 * Unity Editor generates Designer from this; Cocos uses it for tooling or manual maps.
 */
export class CodeGenKit {

    public static CollectBinds(root: cc.Node): IBind[] {
        const result: IBind[] = [];
        const binds = root.getComponentsInChildren(AbstractBind);
        if (binds) {
            for (let i = 0; i < binds.length; i++) {
                result.push(binds[i]);
            }
        }
        return result;
    }

    /**
     * Example Designer pattern (hand-written):
     *
     * ```ts
     * @ccclass
     * export class UIHomePanel extends UIPanel {
     *     @property(cc.Button)
     *     public BtnStart: cc.Button = null;
     *     protected OnClose() {}
     * }
     * ```
     *
     * Mark nodes with Bind / ViewController in editor for future codegen tooling.
     */
    public static DesignerHint: string =
        "Write *.Designer.ts with @property bindings; Bind/ViewController are markers for tooling.";
}

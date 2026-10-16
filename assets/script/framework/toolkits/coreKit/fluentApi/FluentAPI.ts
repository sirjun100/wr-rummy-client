/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * FluentAPI for Cocos Creator (TypeScript)
 * Cocos subset: cc.Node / cc.Component / cc.Vec2 / cc.Vec3 + CSharp helpers
 * Call InstallFluentAPI() once to enable node.Show().Parent(...) chains.
 ****************************************************************************/


import * as cc from 'cc';
// #region CSharp Helpers

export function IsNull(self: any): boolean {
    return self == null;
}

export function IsNotNull(self: any): boolean {
    return self != null;
}

export function Self<T>(self: T, onSelf: (s: T) => void): T {
    if (onSelf) {
        onSelf(self);
    }
    return self;
}

export function As<T>(self: any): T {
    return self as T;
}

export function IsNullOrEmpty(selfStr: string): boolean {
    return selfStr == null || selfStr === "";
}

export function IsNotNullAndEmpty(selfStr: string): boolean {
    return !IsNullOrEmpty(selfStr);
}

export function FillFormat(selfStr: string, ...args: any[]): string {
    let result = selfStr;
    for (let i = 0; i < args.length; i++) {
        result = result.replace("{" + i + "}", String(args[i]));
    }
    return result;
}

export function ForEach<T>(list: T[], action: (item: T, index?: number) => void): T[] {
    if (!list) {
        return list;
    }
    for (let i = 0; i < list.length; i++) {
        action(list[i], i);
    }
    return list;
}

export function CollectionIsNullOrEmpty(list: any[]): boolean {
    return !list || list.length === 0;
}

// #endregion

// #region Node Fluent

export function NodeShow(self: cc.Node): cc.Node {
    self.active = true;
    return self;
}

export function NodeHide(self: cc.Node): cc.Node {
    self.active = false;
    return self;
}

export function ComponentShow<T extends cc.Component>(self: T): T {
    if (self && self.node) {
        self.node.active = true;
    }
    return self;
}

export function ComponentHide<T extends cc.Component>(self: T): T {
    if (self && self.node) {
        self.node.active = false;
    }
    return self;
}

export function NodeName(self: cc.Node, name: string): cc.Node {
    self.name = name;
    return self;
}

export function NodeParent(self: cc.Node, parent: cc.Node): cc.Node {
    self.parent = parent;
    return self;
}

export function NodeAsRoot(self: cc.Node): cc.Node {
    const scene = cc.director.getScene();
    if (scene) {
        self.parent = scene;
    } else {
        self.removeFromParent();
    }
    return self;
}

export function NodeLocalIdentity(self: cc.Node): cc.Node {
    self.setPosition(0, 0);
    self.angle = 0;
    self.setScale(1, 1);
    return self;
}

export function NodeIdentity(self: cc.Node): cc.Node {
    return NodeLocalIdentity(self);
}

export function NodeLocalPosition(self: cc.Node, x: number | cc.Vec2 | cc.Vec3, y?: number, z?: number): cc.Node {
    if (typeof x === "number") {
        self.setPosition(x, y != null ? y : self.y, z != null ? z : self.z);
    } else if (x) {
        const v = x as cc.Vec2 | cc.Vec3;
        self.setPosition(v.x, v.y, (v as cc.Vec3).z || 0);
    }
    return self;
}

export function NodeLocalPositionX(self: cc.Node, x: number): cc.Node {
    self.x = x;
    return self;
}

export function NodeLocalPositionY(self: cc.Node, y: number): cc.Node {
    self.y = y;
    return self;
}

export function NodeLocalPositionZ(self: cc.Node, z: number): cc.Node {
    self.z = z;
    return self;
}

function convertWorldToLocal(parent: cc.Node, world: cc.Vec3): cc.Vec3 {
    const ui = parent.getComponent(cc.UITransform);
    return ui ? ui.convertToNodeSpaceAR(world) : world;
}

export function NodePosition(self: cc.Node, x: number | cc.Vec2 | cc.Vec3, y?: number, z?: number): cc.Node {
    if (typeof x === "number") {
        const point = cc.v3(x, y != null ? y : 0, z != null ? z : 0);
        self.setPosition(self.parent ? convertWorldToLocal(self.parent, point) : point);
    } else if (x) {
        const v = x as cc.Vec2 | cc.Vec3;
        const point = cc.v3(v.x, v.y, (v as cc.Vec3).z || 0);
        self.setPosition(self.parent ? convertWorldToLocal(self.parent, point) : point);
    }
    return self;
}

export function NodeLocalScale(self: cc.Node, x: number | cc.Vec2 | cc.Vec3, y?: number): cc.Node {
    if (typeof x === "number") {
        self.setScale(x, y != null ? y : x);
    } else if (x) {
        const v = x as cc.Vec2 | cc.Vec3;
        self.setScale(v.x, v.y, (v as cc.Vec3).z != null ? (v as cc.Vec3).z : 1);
    }
    return self;
}

export function NodeLocalScaleIdentity(self: cc.Node): cc.Node {
    self.setScale(1, 1);
    return self;
}

export function NodeLocalScaleX(self: cc.Node, x: number): cc.Node {
    const s = self.getScale();
    self.setScale(x, s.y, s.z);
    return self;
}

export function NodeLocalScaleY(self: cc.Node, y: number): cc.Node {
    const s = self.getScale();
    self.setScale(s.x, y, s.z);
    return self;
}

export function NodeLocalEulerAnglesZ(self: cc.Node, z: number): cc.Node {
    self.angle = z;
    return self;
}

export function NodeDestroyChildren(self: cc.Node): cc.Node {
    self.removeAllChildren();
    return self;
}

export function NodeDestroyChildrenWithCondition(self: cc.Node, condition: (child: cc.Node) => boolean): cc.Node {
    const children = self.children.slice();
    for (let i = 0; i < children.length; i++) {
        if (condition(children[i])) {
            children[i].destroy();
        }
    }
    return self;
}

export function NodeAsLastSibling(self: cc.Node): cc.Node {
    if (self.parent) {
        self.setSiblingIndex(self.parent.children.length - 1);
    }
    return self;
}

export function NodeAsFirstSibling(self: cc.Node): cc.Node {
    if (self.parent) {
        self.setSiblingIndex(0);
    }
    return self;
}

export function NodeSiblingIndex(self: cc.Node, index: number): cc.Node {
    self.setSiblingIndex(index);
    return self;
}

export function NodeDestroySelf(self: cc.Node): void {
    self.destroy();
}

export function NodeDestroySelfGracefully(self: cc.Node): cc.Node {
    if (self && cc.isValid(self)) {
        self.destroy();
    }
    return self;
}

export function NodeInstantiate(self: cc.Node): cc.Node {
    return cc.instantiate(self);
}

export function NodeInstantiateWithParent(self: cc.Node, parent: cc.Node): cc.Node {
    const node = cc.instantiate(self);
    node.parent = parent;
    return node;
}

export function NodeGetOrAddComponent<T extends cc.Component>(self: cc.Node, type: { new(): T }): T {
    let comp = self.getComponent(type);
    if (!comp) {
        comp = self.addComponent(type);
    }
    return comp;
}

export function ComponentEnable<T extends cc.Component>(self: T): T {
    self.enabled = true;
    return self;
}

export function ComponentDisable<T extends cc.Component>(self: T): T {
    self.enabled = false;
    return self;
}

// #endregion

// #region Vec Fluent

export function Vec2X(self: cc.Vec2, x: number): cc.Vec2 {
    self.x = x;
    return self;
}

export function Vec2Y(self: cc.Vec2, y: number): cc.Vec2 {
    self.y = y;
    return self;
}

export function Vec3X(self: cc.Vec3, x: number): cc.Vec3 {
    self.x = x;
    return self;
}

export function Vec3Y(self: cc.Vec3, y: number): cc.Vec3 {
    self.y = y;
    return self;
}

export function Vec3Z(self: cc.Vec3, z: number): cc.Vec3 {
    self.z = z;
    return self;
}

export function ToVector2(self: cc.Vec3): cc.Vec2 {
    return cc.v2(self.x, self.y);
}

export function ToVector3(self: cc.Vec2, z: number = 0): cc.Vec3 {
    return cc.v3(self.x, self.y, z);
}

export function Distance2D(a: cc.Vec2 | cc.Vec3, b: cc.Vec2 | cc.Vec3): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function Direction2DTo(from: cc.Vec2, to: cc.Vec2): cc.Vec2 {
    return cc.v2(to.x - from.x, to.y - from.y);
}

export function NormalizedDirection2DTo(from: cc.Vec2, to: cc.Vec2): cc.Vec2 {
    const dir = Direction2DTo(from, to);
    dir.normalize();
    return dir;
}

// #endregion

// #region Install (prototype chain)

let mInstalled: boolean = false;

/**
 * Patch cc.Node / cc.Component prototypes for Unity-like chain calls:
 * `node.Show().Parent(root).LocalPosition(0, 0)`
 */
export function InstallFluentAPI(): void {
    if (mInstalled) {
        return;
    }
    mInstalled = true;

    const nodeProto = cc.Node.prototype as any;
    nodeProto.Show = function (): cc.Node { return NodeShow(this); };
    nodeProto.Hide = function (): cc.Node { return NodeHide(this); };
    nodeProto.Name = function (name: string): cc.Node { return NodeName(this, name); };
    nodeProto.Parent = function (parent: cc.Node): cc.Node { return NodeParent(this, parent); };
    nodeProto.AsRootTransform = function (): cc.Node { return NodeAsRoot(this); };
    nodeProto.AsRootGameObject = function (): cc.Node { return NodeAsRoot(this); };
    nodeProto.LocalIdentity = function (): cc.Node { return NodeLocalIdentity(this); };
    nodeProto.Identity = function (): cc.Node { return NodeIdentity(this); };
    nodeProto.LocalPosition = function (x: any, y?: number, z?: number): cc.Node {
        return NodeLocalPosition(this, x, y, z);
    };
    nodeProto.LocalPositionX = function (x: number): cc.Node { return NodeLocalPositionX(this, x); };
    nodeProto.LocalPositionY = function (y: number): cc.Node { return NodeLocalPositionY(this, y); };
    nodeProto.LocalPositionZ = function (z: number): cc.Node { return NodeLocalPositionZ(this, z); };
    nodeProto.Position = function (x: any, y?: number, z?: number): cc.Node {
        return NodePosition(this, x, y, z);
    };
    nodeProto.LocalScale = function (x: any, y?: number): cc.Node { return NodeLocalScale(this, x, y); };
    nodeProto.LocalScaleIdentity = function (): cc.Node { return NodeLocalScaleIdentity(this); };
    nodeProto.LocalScaleX = function (x: number): cc.Node { return NodeLocalScaleX(this, x); };
    nodeProto.LocalScaleY = function (y: number): cc.Node { return NodeLocalScaleY(this, y); };
    nodeProto.LocalEulerAnglesZ = function (z: number): cc.Node { return NodeLocalEulerAnglesZ(this, z); };
    nodeProto.DestroyChildren = function (): cc.Node { return NodeDestroyChildren(this); };
    nodeProto.DestroyChildrenWithCondition = function (cond: (c: cc.Node) => boolean): cc.Node {
        return NodeDestroyChildrenWithCondition(this, cond);
    };
    nodeProto.AsLastSibling = function (): cc.Node { return NodeAsLastSibling(this); };
    nodeProto.AsFirstSibling = function (): cc.Node { return NodeAsFirstSibling(this); };
    nodeProto.SiblingIndex = function (i: number): cc.Node { return NodeSiblingIndex(this, i); };
    nodeProto.DestroySelf = function (): void { NodeDestroySelf(this); };
    nodeProto.DestroySelfGracefully = function (): cc.Node { return NodeDestroySelfGracefully(this); };
    nodeProto.Instantiate = function (): cc.Node { return NodeInstantiate(this); };
    nodeProto.InstantiateWithParent = function (parent: cc.Node): cc.Node {
        return NodeInstantiateWithParent(this, parent);
    };
    nodeProto.GetOrAddComponent = function (type: any): any { return NodeGetOrAddComponent(this, type); };

    const compProto = cc.Component.prototype as any;
    compProto.Show = function (): any { return ComponentShow(this); };
    compProto.Hide = function (): any { return ComponentHide(this); };
    compProto.Enable = function (): any { return ComponentEnable(this); };
    compProto.Disable = function (): any { return ComponentDisable(this); };
    compProto.Parent = function (parent: cc.Node): any {
        NodeParent(this.node, parent);
        return this;
    };
    compProto.LocalPosition = function (x: any, y?: number, z?: number): any {
        NodeLocalPosition(this.node, x, y, z);
        return this;
    };
    compProto.DestroyGameObj = function (): void { NodeDestroySelf(this.node); };
    compProto.DestroyGameObjGracefully = function (): any {
        NodeDestroySelfGracefully(this.node);
        return this;
    };
    compProto.GetOrAddComponent = function (type: any): any {
        return NodeGetOrAddComponent(this.node, type);
    };
}

/** Static facade mirroring common chain usage without prototype install */
export const FluentAPI = {
    Install: InstallFluentAPI,
    Show: NodeShow,
    Hide: NodeHide,
    Parent: NodeParent,
    LocalIdentity: NodeLocalIdentity,
    LocalPosition: NodeLocalPosition,
    Position: NodePosition,
    LocalScale: NodeLocalScale,
    DestroyChildren: NodeDestroyChildren,
    GetOrAddComponent: NodeGetOrAddComponent,
    Instantiate: NodeInstantiate,
    InstantiateWithParent: NodeInstantiateWithParent,
    IsNullOrEmpty,
    IsNotNullAndEmpty,
    FillFormat,
    ForEach,
};

// #endregion

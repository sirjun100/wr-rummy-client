/****************************************************************************
 * Copyright (c) 2017 Thor Brigsted / 2022~2024 liangxiegame MIT License
 * Based on xNode: https://github.com/Siccity/xNode
 *
 * GraphKit for Cocos Creator (TypeScript) — runtime only (no Editor/IMGUI)
 ****************************************************************************/


import * as cc from 'cc';
// #region Enums / Attributes

export enum ShowBackingValue {
    Never,
    Unconnected,
    Always,
}

export enum ConnectionType {
    Multiple,
    Override,
}

export enum TypeConstraint {
    None,
    Inherited,
    Strict,
    InheritedInverse,
}

export enum PortIO {
    Input,
    Output,
}

export class InputAttribute {
    public connectionType: ConnectionType = ConnectionType.Multiple;
    public typeConstraint: TypeConstraint = TypeConstraint.None;
    public backingValue: ShowBackingValue = ShowBackingValue.Unconnected;

    public constructor(
        backingValue: ShowBackingValue = ShowBackingValue.Unconnected,
        connectionType: ConnectionType = ConnectionType.Multiple,
        typeConstraint: TypeConstraint = TypeConstraint.None
    ) {
        this.backingValue = backingValue;
        this.connectionType = connectionType;
        this.typeConstraint = typeConstraint;
    }
}

export class OutputAttribute {
    public connectionType: ConnectionType = ConnectionType.Multiple;
    public typeConstraint: TypeConstraint = TypeConstraint.None;
    public backingValue: ShowBackingValue = ShowBackingValue.Never;

    public constructor(
        backingValue: ShowBackingValue = ShowBackingValue.Never,
        connectionType: ConnectionType = ConnectionType.Multiple,
        typeConstraint: TypeConstraint = TypeConstraint.None
    ) {
        this.backingValue = backingValue;
        this.connectionType = connectionType;
        this.typeConstraint = typeConstraint;
    }
}

// #endregion

// #region GUIGraphNodePort

export class PortConnection {
    public node: GUIGraphNode = null;
    public fieldName: string = "";

    public constructor(port: GUIGraphNodePort = null) {
        if (port) {
            this.node = port.node;
            this.fieldName = port.fieldName;
        }
    }

    public get Port(): GUIGraphNodePort {
        if (!this.node) {
            return null;
        }
        return this.node.GetPort(this.fieldName);
    }
}

export class GUIGraphNodePort {

    public direction: PortIO = PortIO.Input;
    public connectionType: ConnectionType = ConnectionType.Multiple;
    public typeConstraint: TypeConstraint = TypeConstraint.None;

    private _fieldName: string = "";
    private _node: GUIGraphNode = null;
    private _dynamic: boolean = false;
    private valueType: Function = null;
    private readonly connections: PortConnection[] = [];

    public get fieldName(): string {
        return this._fieldName;
    }

    public get node(): GUIGraphNode {
        return this._node;
    }

    public get IsDynamic(): boolean {
        return this._dynamic;
    }

    public get IsStatic(): boolean {
        return !this._dynamic;
    }

    public get IsInput(): boolean {
        return this.direction === PortIO.Input;
    }

    public get IsOutput(): boolean {
        return this.direction === PortIO.Output;
    }

    public get IsConnected(): boolean {
        return this.connections.length !== 0;
    }

    public get ConnectionCount(): number {
        return this.connections.length;
    }

    public get Connection(): GUIGraphNodePort {
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i] != null) {
                return this.connections[i].Port;
            }
        }
        return null;
    }

    public get ValueType(): Function {
        return this.valueType;
    }

    public set ValueType(value: Function) {
        this.valueType = value;
    }

    public static Create(
        node: GUIGraphNode,
        fieldName: string,
        direction: PortIO,
        valueType: Function = null,
        dynamic: boolean = false,
        connectionType: ConnectionType = ConnectionType.Multiple,
        typeConstraint: TypeConstraint = TypeConstraint.None
    ): GUIGraphNodePort {
        const port = new GUIGraphNodePort();
        port._node = node;
        port._fieldName = fieldName;
        port.direction = direction;
        port.valueType = valueType;
        port._dynamic = dynamic;
        port.connectionType = connectionType;
        port.typeConstraint = typeConstraint;
        return port;
    }

    public CanConnectTo(port: GUIGraphNodePort): boolean {
        if (!port || port === this) {
            return false;
        }
        if (port.node === this.node) {
            return false;
        }
        if (this.IsInput === port.IsInput) {
            return false;
        }
        return true;
    }

    public IsConnectedTo(port: GUIGraphNodePort): boolean {
        for (let i = 0; i < this.connections.length; i++) {
            const c = this.connections[i];
            if (c && c.node === port.node && c.fieldName === port.fieldName) {
                return true;
            }
        }
        return false;
    }

    public Connect(port: GUIGraphNodePort): void {
        if (!this.CanConnectTo(port)) {
            return;
        }
        if (this.connectionType === ConnectionType.Override) {
            this.ClearConnections();
        }
        if (port.connectionType === ConnectionType.Override) {
            port.ClearConnections();
        }
        if (!this.IsConnectedTo(port)) {
            this.connections.push(new PortConnection(port));
        }
        if (!port.IsConnectedTo(this)) {
            port.connections.push(new PortConnection(this));
        }
        if (this.node) {
            this.node.OnCreateConnection(this, port);
        }
        if (port.node) {
            port.node.OnCreateConnection(this, port);
        }
    }

    public Disconnect(port: GUIGraphNodePort): void {
        for (let i = this.connections.length - 1; i >= 0; i--) {
            const c = this.connections[i];
            if (c && c.node === port.node && c.fieldName === port.fieldName) {
                this.connections.splice(i, 1);
            }
        }
        for (let i = port.connections.length - 1; i >= 0; i--) {
            const c = port.connections[i];
            if (c && c.node === this.node && c.fieldName === this.fieldName) {
                port.connections.splice(i, 1);
            }
        }
        if (this.node) {
            this.node.OnRemoveConnection(this);
        }
        if (port.node) {
            port.node.OnRemoveConnection(port);
        }
    }

    public ClearConnections(): void {
        while (this.connections.length > 0) {
            const c = this.connections[0];
            if (c && c.Port) {
                this.Disconnect(c.Port);
            } else {
                this.connections.shift();
            }
        }
    }

    public GetConnections(): GUIGraphNodePort[] {
        const result: GUIGraphNodePort[] = [];
        for (let i = 0; i < this.connections.length; i++) {
            const p = this.connections[i].Port;
            if (p) {
                result.push(p);
            }
        }
        return result;
    }

    public VerifyConnections(): void {
        for (let i = this.connections.length - 1; i >= 0; i--) {
            const c = this.connections[i];
            if (!c || !c.node || !c.Port) {
                this.connections.splice(i, 1);
            }
        }
    }

    public GetInputValue(): any {
        if (!this.IsInput) {
            return null;
        }
        const connected = this.Connection;
        if (!connected) {
            return null;
        }
        return connected.node.GetValue(connected);
    }

    public GetOutputValue(): any {
        if (!this.IsOutput || !this.node) {
            return null;
        }
        return this.node.GetValue(this);
    }

    public Redirect(oldNodes: GUIGraphNode[], newNodes: GUIGraphNode[]): void {
        for (let i = 0; i < this.connections.length; i++) {
            const c = this.connections[i];
            if (!c || !c.node) {
                continue;
            }
            const idx = oldNodes.indexOf(c.node);
            if (idx >= 0 && idx < newNodes.length) {
                c.node = newNodes[idx];
            }
        }
    }
}

// #endregion

// #region GUIGraphNode

export abstract class GUIGraphNode {

    public graph: GUIGraph = null;
    public position: cc.Vec2 = cc.v2(0, 0);
    public static graphHotfix: GUIGraph = null;

    private readonly ports: Map<string, GUIGraphNodePort> = new Map();

    public get Ports(): GUIGraphNodePort[] {
        const result: GUIGraphNodePort[] = [];
        this.ports.forEach((p) => result.push(p));
        return result;
    }

    public get Inputs(): GUIGraphNodePort[] {
        return this.Ports.filter((p) => p.IsInput);
    }

    public get Outputs(): GUIGraphNodePort[] {
        return this.Ports.filter((p) => p.IsOutput);
    }

    public get DynamicPorts(): GUIGraphNodePort[] {
        return this.Ports.filter((p) => p.IsDynamic);
    }

    public InitNode(): void {
        if (GUIGraphNode.graphHotfix) {
            this.graph = GUIGraphNode.graphHotfix;
            GUIGraphNode.graphHotfix = null;
        }
        this.OnInit();
    }

    protected OnInit(): void {
    }

    public AddPort(
        fieldName: string,
        direction: PortIO,
        valueType: Function = null,
        dynamic: boolean = false,
        connectionType: ConnectionType = ConnectionType.Multiple,
        typeConstraint: TypeConstraint = TypeConstraint.None
    ): GUIGraphNodePort {
        const port = GUIGraphNodePort.Create(
            this, fieldName, direction, valueType, dynamic, connectionType, typeConstraint
        );
        this.ports.set(fieldName, port);
        return port;
    }

    public AddDynamicInput(
        type: Function = null,
        connectionType: ConnectionType = ConnectionType.Multiple,
        typeConstraint: TypeConstraint = TypeConstraint.None,
        fieldName: string = null
    ): GUIGraphNodePort {
        if (!fieldName) {
            fieldName = "in_" + this.ports.size;
        }
        return this.AddPort(fieldName, PortIO.Input, type, true, connectionType, typeConstraint);
    }

    public AddDynamicOutput(
        type: Function = null,
        connectionType: ConnectionType = ConnectionType.Multiple,
        typeConstraint: TypeConstraint = TypeConstraint.None,
        fieldName: string = null
    ): GUIGraphNodePort {
        if (!fieldName) {
            fieldName = "out_" + this.ports.size;
        }
        return this.AddPort(fieldName, PortIO.Output, type, true, connectionType, typeConstraint);
    }

    public RemoveDynamicPort(fieldName: string): void {
        const port = this.ports.get(fieldName);
        if (port && port.IsDynamic) {
            port.ClearConnections();
            this.ports.delete(fieldName);
        }
    }

    public ClearDynamicPorts(): void {
        const names: string[] = [];
        this.ports.forEach((p, name) => {
            if (p.IsDynamic) {
                names.push(name);
            }
        });
        for (let i = 0; i < names.length; i++) {
            this.RemoveDynamicPort(names[i]);
        }
    }

    public GetPort(fieldName: string): GUIGraphNodePort {
        return this.ports.has(fieldName) ? this.ports.get(fieldName) : null;
    }

    public GetInputPort(fieldName: string): GUIGraphNodePort {
        const port = this.GetPort(fieldName);
        return port && port.IsInput ? port : null;
    }

    public GetOutputPort(fieldName: string): GUIGraphNodePort {
        const port = this.GetPort(fieldName);
        return port && port.IsOutput ? port : null;
    }

    public HasPort(fieldName: string): boolean {
        return this.ports.has(fieldName);
    }

    public GetInputValue(fieldName: string, fallback: any = null): any {
        const port = this.GetInputPort(fieldName);
        if (!port || !port.IsConnected) {
            return fallback;
        }
        return port.GetInputValue();
    }

    public GetInputValues(fieldName: string): any[] {
        const port = this.GetInputPort(fieldName);
        if (!port) {
            return [];
        }
        const connections = port.GetConnections();
        const result: any[] = [];
        for (let i = 0; i < connections.length; i++) {
            result.push(connections[i].node.GetValue(connections[i]));
        }
        return result;
    }

    public GetValue(port: GUIGraphNodePort): any {
        return null;
    }

    public OnCreateConnection(from: GUIGraphNodePort, to: GUIGraphNodePort): void {
    }

    public OnRemoveConnection(port: GUIGraphNodePort): void {
    }

    public ClearConnections(): void {
        this.Ports.forEach((p) => p.ClearConnections());
    }

    public VerifyConnections(): void {
        this.Ports.forEach((p) => p.VerifyConnections());
    }
}

// #endregion

// #region GUIGraph

export abstract class GUIGraph {

    public Name: string = "Graph";
    public nodes: GUIGraphNode[] = [];

    public AddNode<T extends GUIGraphNode>(type: new () => T): T {
        return this.AddNodeByCtor(type) as T;
    }

    public AddNodeByCtor(type: new () => GUIGraphNode): GUIGraphNode {
        GUIGraphNode.graphHotfix = this;
        const node = new type();
        node.graph = this;
        node.InitNode();
        this.nodes.push(node);
        return node;
    }

    public RemoveNode(node: GUIGraphNode): void {
        if (!node) {
            return;
        }
        node.ClearConnections();
        const idx = this.nodes.indexOf(node);
        if (idx >= 0) {
            this.nodes.splice(idx, 1);
        }
        node.graph = null;
    }

    public Clear(): void {
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            this.nodes[i].ClearConnections();
            this.nodes[i].graph = null;
        }
        this.nodes.length = 0;
    }

    public CopyNode(original: GUIGraphNode): GUIGraphNode {
        if (!original) {
            return null;
        }
        const ctor = (original as object).constructor as new () => GUIGraphNode;
        const node = this.AddNodeByCtor(ctor);
        node.position = original.position.clone();
        node.ClearConnections();
        return node;
    }
}

/** Scene holder — attach to a node to keep a graph reference */
const { ccclass } = cc._decorator;

@ccclass
export class GUISceneGraph extends cc.Component {
    public graph: GUIGraph = null;
}

export class GraphKit {
    public static CreateGraph<T extends GUIGraph>(ctor: new () => T): T {
        return new ctor();
    }
}

// #endregion

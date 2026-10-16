/****************************************************************************
 * Copyright (c) 2018 ~ 2024 liangxiegame MIT License
 *
 * IOCKit for Cocos Creator (TypeScript)
 * Standalone DI container — different from Architecture's private IOCContainer.
 ****************************************************************************/

type TypeCtor = new (...args: any[]) => any;

// #region Inject Attribute / Metadata

export class InjectAttribute {
    public Name: string = null;

    public constructor(name: string = null) {
        this.Name = name;
    }
}

interface InjectMeta {
    propertyKey: string;
    type: TypeCtor | Function;
    name: string;
}

const injectMetaMap: Map<Function, InjectMeta[]> = new Map();

/**
 * Property decorator for injection.
 * Usage: `@Inject(IService)` or `@Inject(IService, "name")` on class fields.
 * Note: TS requires the type token explicitly (no C# field-type reflection).
 */
export function Inject(type: TypeCtor | Function, name: string = null): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        const ctor = (target as object).constructor;
        let list = injectMetaMap.get(ctor);
        if (!list) {
            list = [];
            injectMetaMap.set(ctor, list);
        }
        list.push({
            propertyKey: String(propertyKey),
            type: type,
            name: name,
        });
    };
}

function GetInjectMeta(obj: object): InjectMeta[] {
    const result: InjectMeta[] = [];
    let proto: object = Object.getPrototypeOf(obj);
    while (proto && proto !== Object.prototype) {
        const ctor = proto.constructor;
        const list = injectMetaMap.get(ctor);
        if (list) {
            for (let i = 0; i < list.length; i++) {
                result.push(list[i]);
            }
        }
        proto = Object.getPrototypeOf(proto);
    }
    return result;
}

// #endregion

// #region Collections

export class Tuple2<T1, T2> {
    public readonly Item1: T1;
    public readonly Item2: T2;

    public constructor(item1: T1, item2: T2) {
        this.Item1 = item1;
        this.Item2 = item2;
    }

    public Equals(other: Tuple2<T1, T2>): boolean {
        if (!other) {
            return false;
        }
        return this.Item1 === other.Item1 && this.Item2 === other.Item2;
    }

    public Key(): string {
        const a = this.Item1 ? ((this.Item1 as any).name || String(this.Item1)) : "null";
        const b = this.Item2 != null ? String(this.Item2) : "null";
        return a + "::" + b;
    }
}

export class TypeMappingCollection {
    private readonly mMap: Map<string, Function> = new Map();
    private readonly mKeys: Tuple2<Function, string>[] = [];

    public get(from: Function, name: string = null): Function {
        const key = new Tuple2(from, name).Key();
        return this.mMap.has(key) ? this.mMap.get(key) : null;
    }

    public set(from: Function, name: string, value: Function): void {
        const tuple = new Tuple2(from, name);
        const key = tuple.Key();
        if (!this.mMap.has(key)) {
            this.mKeys.push(tuple);
        }
        this.mMap.set(key, value);
    }

    public Clear(): void {
        this.mMap.clear();
        this.mKeys.length = 0;
    }

    public ForEach(action: (from: Function, name: string, to: Function) => void): void {
        for (let i = 0; i < this.mKeys.length; i++) {
            const k = this.mKeys[i];
            action(k.Item1, k.Item2, this.mMap.get(k.Key()));
        }
    }
}

export class TypeInstanceCollection {
    private readonly mMap: Map<string, object> = new Map();
    private readonly mKeys: Tuple2<Function, string>[] = [];

    public get(from: Function, name: string = null): object {
        const key = new Tuple2(from, name).Key();
        return this.mMap.has(key) ? this.mMap.get(key) : null;
    }

    public set(from: Function, name: string, value: object): void {
        const tuple = new Tuple2(from, name);
        const key = tuple.Key();
        if (!this.mMap.has(key)) {
            this.mKeys.push(tuple);
        }
        this.mMap.set(key, value);
    }

    public Clear(): void {
        this.mMap.clear();
        this.mKeys.length = 0;
    }

    public get Values(): object[] {
        const result: object[] = [];
        this.mMap.forEach((v) => result.push(v));
        return result;
    }

    public ForEach(action: (from: Function, name: string, instance: object) => void): void {
        for (let i = 0; i < this.mKeys.length; i++) {
            const k = this.mKeys[i];
            action(k.Item1, k.Item2, this.mMap.get(k.Key()));
        }
    }
}

export class TypeRelationCollection {
    private readonly mMap: Map<string, Function> = new Map();

    private static Key(from: Function, to: Function): string {
        const a = from ? ((from as any).name || String(from)) : "null";
        const b = to ? ((to as any).name || String(to)) : "null";
        return a + "->" + b;
    }

    public get(from: Function, to: Function): Function {
        const key = TypeRelationCollection.Key(from, to);
        return this.mMap.has(key) ? this.mMap.get(key) : null;
    }

    public set(from: Function, to: Function, concrete: Function): void {
        this.mMap.set(TypeRelationCollection.Key(from, to), concrete);
    }

    public Clear(): void {
        this.mMap.clear();
    }
}

// #endregion

// #region IQFrameworkContainer / QFrameworkContainer

export interface IQFrameworkContainer {
    Clear(): void;
    Inject(obj: object): void;
    InjectAll(): void;
    Register(source: Function, target: Function, name?: string): void;
    RegisterSource(source: Function, name?: string): void;
    RegisterInstance(baseType: Function, instance: object, name?: string, injectNow?: boolean): void;
    Resolve(baseType: Function, name?: string, requireInstance?: boolean, ...constructorArgs: any[]): object;
    ResolveAll(type: Function): object[];
    RegisterRelation(tfor: Function, tbase: Function, tconcrete: Function): void;
    ResolveRelation(tfor: Function, tbase: Function, ...args: any[]): object;
    CreateInstance(type: Function, ...args: any[]): object;
    Mappings: TypeMappingCollection;
    Instances: TypeInstanceCollection;
    RelationshipMappings: TypeRelationCollection;
}

export class QFrameworkContainer implements IQFrameworkContainer {

    public Mappings: TypeMappingCollection = new TypeMappingCollection();
    public Instances: TypeInstanceCollection = new TypeInstanceCollection();
    public RelationshipMappings: TypeRelationCollection = new TypeRelationCollection();

    public Clear(): void {
        this.Instances.Clear();
        this.Mappings.Clear();
        this.RelationshipMappings.Clear();
    }

    public Inject(obj: object): void {
        if (!obj) {
            return;
        }
        const metas = GetInjectMeta(obj);
        for (let i = 0; i < metas.length; i++) {
            const meta = metas[i];
            const value = this.Resolve(meta.type as Function, meta.name);
            if (value != null) {
                (obj as any)[meta.propertyKey] = value;
            }
        }
    }

    public InjectAll(): void {
        const values = this.Instances.Values;
        for (let i = 0; i < values.length; i++) {
            this.Inject(values[i]);
        }
    }

    /** C# Register<TSource>() — map type to itself */
    public RegisterSource(source: Function, name: string = null): void {
        this.Mappings.set(source, name, source);
    }

    /** C# Register<TSource, TTarget>(name) */
    public Register(source: Function, target: Function, name: string = null): void {
        this.Mappings.set(source, name, target);
    }

    public RegisterInstance(
        baseType: Function,
        instance: object,
        name: string = null,
        injectNow: boolean = true
    ): void {
        this.Instances.set(baseType, name, instance);
        if (injectNow) {
            this.Inject(instance);
        }
    }

    public Resolve(
        baseType: Function,
        name: string = null,
        requireInstance: boolean = false,
        ...constructorArgs: any[]
    ): object {
        const item = this.Instances.get(baseType, name);
        if (item != null) {
            return item;
        }
        if (requireInstance) {
            return null;
        }
        const namedMapping = this.Mappings.get(baseType, name);
        if (namedMapping != null) {
            return this.CreateInstance(namedMapping, ...constructorArgs);
        }
        return null;
    }

    public ResolveTyped<T>(
        baseType: Function,
        name: string = null,
        requireInstance: boolean = false,
        ...constructorArgs: any[]
    ): T {
        return this.Resolve(baseType, name, requireInstance, ...constructorArgs) as T;
    }

    public ResolveAll(type: Function): object[] {
        const result: object[] = [];
        this.Instances.ForEach((from, name, instance) => {
            if (from === type && name) {
                result.push(instance);
            }
        });
        this.Mappings.ForEach((from, name, to) => {
            if (name && from === type) {
                const item = this.CreateInstance(to);
                result.push(item);
            }
        });
        return result;
    }

    public ResolveAllTyped<T>(type: Function): T[] {
        return this.ResolveAll(type) as T[];
    }

    public RegisterRelation(tfor: Function, tbase: Function, tconcrete: Function): void {
        this.RelationshipMappings.set(tfor, tbase, tconcrete);
    }

    public ResolveRelation(tfor: Function, tbase: Function, ...args: any[]): object {
        const concreteType = this.RelationshipMappings.get(tfor, tbase);
        if (!concreteType) {
            return null;
        }
        return this.CreateInstance(concreteType, ...args);
    }

    public CreateInstance(type: Function, ...args: any[]): object {
        const ctor = type as TypeCtor;
        let obj: object;
        if (args && args.length > 0) {
            obj = new ctor(...args);
        } else {
            obj = new ctor();
        }
        this.Inject(obj);
        return obj;
    }
}

/** Alias for API discovery */
export class IOCKit {
    public static CreateContainer(): QFrameworkContainer {
        return new QFrameworkContainer();
    }
}

// #endregion

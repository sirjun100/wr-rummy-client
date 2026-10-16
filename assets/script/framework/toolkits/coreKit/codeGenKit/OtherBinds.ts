/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * OtherBinds — one Component per file (Cocos 2.x restriction)
 ****************************************************************************/


import * as cc from 'cc';
const { ccclass } = cc._decorator;

export class BindInfo {
    public MemberName: string = "";
    public Object: any = null;

    public constructor(memberName: string = "", obj: any = null) {
        this.MemberName = memberName;
        this.Object = obj;
    }
}

@ccclass
export class OtherBinds extends cc.Component {

    public Binds: BindInfo[] = [];

    public Add(memberName: string, obj: any): void {
        this.Binds.push(new BindInfo(memberName, obj));
    }

    public Clear(): void {
        this.Binds.length = 0;
    }
}

/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * BindablePropertyKit for Cocos Creator (TypeScript)
 ****************************************************************************/


import * as cc from 'cc';
import { BindableProperty } from "../../../QFramework";

// #region PlayerPrefs Properties

export class PlayerPrefsFloatProperty extends BindableProperty<number> {

    public constructor(saveKey: string, defaultValue: number = 0) {
        super(cc.sys.localStorage.getItem(saveKey) != null
            ? Number(cc.sys.localStorage.getItem(saveKey))
            : defaultValue);
        this.Register((value: number) => {
            cc.sys.localStorage.setItem(saveKey, String(value));
        });
    }
}

export class PlayerPrefsBooleanProperty extends BindableProperty<boolean> {

    public constructor(saveKey: string, defaultValue: boolean = false) {
        const stored = cc.sys.localStorage.getItem(saveKey);
        const init = stored != null ? stored === "1" || stored === "true" : defaultValue;
        super(init);
        this.Register((value: boolean) => {
            cc.sys.localStorage.setItem(saveKey, value ? "1" : "0");
        });
    }
}

// #endregion

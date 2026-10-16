/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * LocaleUnityEvent — one Component per file (Cocos 2.x restriction)
 ****************************************************************************/


import * as cc from 'cc';
import { Language, LanguageEvent, LocaleKit } from "./LocaleKit";

const { ccclass, property } = cc._decorator;

@ccclass
export class LocaleUnityEvent extends cc.Component {

    @property
    public CallOnInit: boolean = true;

    public LocaleEvents: LanguageEvent[] = [];

    protected start(): void {
        LocaleKit.EnsureInit();
        LocaleKit.OnLanguageChanged.Register(() => {
            this.CallLocaleEvent(LocaleKit.CurrentLanguage);
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);

        if (this.CallOnInit) {
            this.CallLocaleEvent(LocaleKit.CurrentLanguage);
        }
    }

    private CallLocaleEvent(language: Language): void {
        if (!this.LocaleEvents) {
            return;
        }
        for (let i = 0; i < this.LocaleEvents.length; i++) {
            if (this.LocaleEvents[i].Language === language) {
                if (this.LocaleEvents[i].OnLocale) {
                    this.LocaleEvents[i].OnLocale();
                }
                return;
            }
        }
    }
}

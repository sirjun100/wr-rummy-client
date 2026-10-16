/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * LocaleKitChangeLanguageAction — one Component per file (Cocos 2.x restriction)
 ****************************************************************************/


import * as cc from 'cc';
import { Language, LocaleKit } from "./LocaleKit";

const { ccclass, property } = cc._decorator;

@ccclass('LocaleKitChangeLanguageAction')
export class LocaleKitChangeLanguageAction extends cc.Component {

    @property({ type: cc.Enum(Language) })
    public Language: Language = Language.English;

    public Execute(): void {
        LocaleKit.ChangeLanguage(this.Language);
    }
}
